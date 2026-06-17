import React, { useState, createContext, useContext, useEffect, useCallback } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Modal, TextInput, Alert, Platform, Dimensions, StyleSheet} from 'react-native';
import { NavigationContainer, useFocusEffect } from '@react-navigation/native';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import { Ionicons } from '@expo/vector-icons';
import { PieChart, BarChart } from 'react-native-chart-kit'; 
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// --- 1. PANTALLAS DE INICIO POR ROL ---
function InicioResidente({ usuario }) {
  const [modalVisible, setModalVisible] = useState(false);
  const [tipoLugar, setTipoLugar] = useState('apartamento'); 
  const [reporte, setReporte] = useState({ titulo: '', descripcion: '', categoria: 'Seguridad', torre_incidente: '', apartamento_incidente: '', area_comun: '' });
  const [modalEstadoVisible, setModalEstadoVisible] = useState(false);
  const [misReportes, setMisReportes] = useState([]);

  const enviarReporte = async () => {
    if (!reporte.titulo || !reporte.descripcion) return Alert.alert('Atención', 'Llena título y descripción.');
      try {
        const DOMINIO = 'https://saferesidenceapp-production.up.railway.app';
        const respuesta = await fetch(`${DOMINIO}/api/reportar`, {
        method: 'POST',
        headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...reporte,
          area_comun: tipoLugar === 'area_comun' ? reporte.area_comun : null,
          torre_incidente: tipoLugar === 'apartamento' ? reporte.torre_incidente : null,
          apartamento_incidente: tipoLugar === 'apartamento' ? reporte.apartamento_incidente : null,
          user_id: usuario?.id,
          fecha: new Date().toISOString().slice(0, 19).replace('T', ' ')
        })
      });
      const resultado = await respuesta.json();
      if (respuesta.ok) {
        Alert.alert('Enviado', 'Tu reporte ha sido recibido por administración.');
        setModalVisible(false);
        setReporte({ titulo: '', descripcion: '', categoria: 'Seguridad', torre_incidente: '', apartamento_incidente: '', area_comun: '' });
      } else {
        Alert.alert('Error', resultado.message || 'No se pudo enviar el reporte.');
      }
    } catch (error) {
      Alert.alert('Error', 'No se pudo conectar al servidor.');
    }
  };

  const cargarMisReportes = async () => {
    if (!usuario?.id) return;
    try {
      const DOMINIO = 'https://saferesidenceapp-production.up.railway.app'; 
      const respuesta = await fetch(`${DOMINIO}/api/reportes/residente/${usuario.id}`);
      if (!respuesta.ok) throw new Error('Error del servidor');
      const datos = await respuesta.json();
      setMisReportes(datos);
      setModalEstadoVisible(true);
    } catch (error) {
      Alert.alert('Error de conexión', 'No se pudieron cargar tus reportes.');
    }
  };

  return (
    <View style={styles.mainContainer}>
      <View style={styles.deepHeader}>
        <View style={{flexDirection: 'row', alignItems: 'center'}}>
          <View style={[styles.profileOptionIconContainer, {marginRight: 15, backgroundColor: 'rgba(255,255,255,0.2)'}]}>
            <Ionicons name="home" size={24} color="#FFF" />
          </View>
          <View>
            <Text style={styles.headerGreeting}>Hola, {usuario?.nombre || 'Residente'} 👋</Text>
            <Text style={styles.headerSubtitle}>¿En qué te podemos ayudar hoy?</Text>
          </View>
        </View>
      </View>
      
      <View style={styles.headerCurve} />

      <ScrollView contentContainerStyle={styles.bodyContent} showsVerticalScrollIndicator={false}>
        <View style={[styles.actionBlock, { marginTop: 15 }]}> 
          <TouchableOpacity style={styles.actionRow} activeOpacity={0.7} onPress={() => setModalVisible(true)}>
            <View style={styles.profileOptionIconContainer}><Ionicons name="add-circle" size={24} color="#00264D" /></View>
            <View style={styles.actionTextGroup}>
              <Text style={styles.profileOptionTitle}>Nuevo Reporte</Text>
              <Text style={styles.actionDesc}>Crear una nueva alerta</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#CCC" />
          </TouchableOpacity>
          <View style={styles.separator} />
          <TouchableOpacity style={styles.actionRow} activeOpacity={0.7} onPress={cargarMisReportes}>
            <View style={styles.profileOptionIconContainer}><Ionicons name="search" size={24} color="#00264D" /></View>
            <View style={styles.actionTextGroup}>
              <Text style={styles.profileOptionTitle}>Mis Reportes</Text>
              <Text style={styles.actionDesc}>Consultar estado y seguimiento</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#CCC" />
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* --- MODAL: CREAR NUEVO REPORTE (Sin cambios) --- */}
      <Modal animationType="slide" transparent={true} visible={modalVisible}>
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' }}>
          <View style={{ backgroundColor: '#FFF', borderTopLeftRadius: 25, borderTopRightRadius: 25, maxHeight: '90%', padding: 25 }}>
            <ScrollView showsVerticalScrollIndicator={false}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20, alignItems: 'center' }}>
                <Text style={{ fontSize: 20, fontWeight: 'bold', color: '#003366' }}>Crear Nuevo Reporte</Text>
                <TouchableOpacity onPress={() => setModalVisible(false)}><Ionicons name="close-circle" size={28} color="#666" /></TouchableOpacity>
              </View>

              <TextInput style={styles.input} placeholder="¿Qué sucede? (Ej. Ruido molesto)" value={reporte.titulo} onChangeText={(t) => setReporte({...reporte, titulo: t})} />
              
              <View style={{ backgroundColor: '#F2F6FA', borderRadius: 10, padding: 5, marginBottom: 15 }}>
                <Text style={{ fontSize: 12, color: '#666', marginLeft: 10, marginTop: 5 }}>Categoría</Text>
                <View style={{ flexDirection: 'row', justifyContent: 'space-around', paddingVertical: 10 }}>
                  {['Seguridad', 'Daño', 'Aseo'].map(cat => (
                    <TouchableOpacity key={cat} onPress={() => setReporte({...reporte, categoria: cat})} style={{ padding: 8, borderRadius: 8, backgroundColor: reporte.categoria === cat ? '#003366' : 'transparent' }}>
                      <Text style={{ color: reporte.categoria === cat ? '#FFF' : '#003366', fontWeight: 'bold' }}>{cat}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <Text style={{ fontSize: 14, fontWeight: 'bold', color: '#003366', marginBottom: 10 }}>¿Dónde ocurrió el incidente? (Opcional)</Text>
              
              <View style={{ flexDirection: 'row', backgroundColor: '#F2F6FA', borderRadius: 10, padding: 4, marginBottom: 15 }}>
                <TouchableOpacity style={{ flex: 1, padding: 10, borderRadius: 8, backgroundColor: tipoLugar === 'apartamento' ? '#003366' : 'transparent', alignItems: 'center' }} onPress={() => setTipoLugar('apartamento')}>
                  <Text style={{ fontWeight: 'bold', color: tipoLugar === 'apartamento' ? '#FFF' : '#666' }}>Apartamento</Text>
                </TouchableOpacity>
                <TouchableOpacity style={{ flex: 1, padding: 10, borderRadius: 8, backgroundColor: tipoLugar === 'area_comun' ? '#003366' : 'transparent', alignItems: 'center' }} onPress={() => setTipoLugar('area_comun')}>
                  <Text style={{ fontWeight: 'bold', color: tipoLugar === 'area_comun' ? '#FFF' : '#666' }}>Área Común</Text>
                </TouchableOpacity>
              </View>

              {tipoLugar === 'apartamento' ? (
                <View style={{flexDirection: 'row', justifyContent: 'space-between'}}>
                  <TextInput style={[styles.input, {width: '48%'}]} placeholder="Torre (Ej. 1)" keyboardType="numeric" value={reporte.torre_incidente} onChangeText={(t) => setReporte({...reporte, torre_incidente: t})} />
                  <TextInput style={[styles.input, {width: '48%'}]} placeholder="Apto (Ej. 101)" keyboardType="numeric" value={reporte.apartamento_incidente} onChangeText={(t) => setReporte({...reporte, apartamento_incidente: t})} />
                </View>
              ) : (
                <TextInput style={styles.input} placeholder="Ej. Piscina, Lobby, Parqueadero" value={reporte.area_comun} onChangeText={(t) => setReporte({...reporte, area_comun: t})} />
              )}

              <TextInput style={[styles.input, { height: 100, textAlignVertical: 'top' }]} placeholder="Describe los detalles del incidente..." multiline={true} value={reporte.descripcion} onChangeText={(t) => setReporte({...reporte, descripcion: t})} />

              <TouchableOpacity style={styles.btnGuardar} onPress={enviarReporte}>
                <Text style={styles.btnTexto}>Enviar Reporte</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* --- MODAL DE SEGUIMIENTO (MIS REPORTES DINÁMICOS) --- */}
      <Modal animationType="slide" transparent={true} visible={modalEstadoVisible}>
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', paddingTop: 50 }}>
          <View style={{ flex: 1, backgroundColor: '#FFF', borderTopLeftRadius: 25, borderTopRightRadius: 25, padding: 20 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 15, alignItems: 'center' }}>
              <Text style={{ fontSize: 20, fontWeight: 'bold', color: '#003366' }}>Seguimiento de Casos</Text>
              <TouchableOpacity onPress={() => setModalEstadoVisible(false)}><Ionicons name="close-circle" size={28} color="#666" /></TouchableOpacity>
            </View>
            <ScrollView showsVerticalScrollIndicator={false}>
              {misReportes.length === 0 ? <Text style={{textAlign: 'center', marginTop: 20, color: '#666'}}>No tienes reportes creados actualmente ✅</Text> : null}
              {misReportes.map((caso) => (
                <View key={caso.id} style={{ backgroundColor: '#F8F9FA', padding: 18, borderRadius: 15, marginBottom: 18, borderWidth: 1, borderColor: '#E1E8EE' }}>
                  <Text style={{ fontWeight: 'bold', fontSize: 16, color: '#00264D' }}>{caso.categoria} - {caso.titulo}</Text>
                  <Text style={{ fontSize: 12, color: caso.estado === 'Resuelto' || caso.estado === 'Terminado' ? '#34C759' : '#FF9500', fontWeight: 'bold', marginVertical: 5 }}>ESTADO: {caso.estado?.toUpperCase() || 'PENDIENTE'}</Text>
                  
                  {/* BITÁCORA DEL RESIDENTE */}
                  <View style={{ backgroundColor: '#FFF', borderRadius: 10, padding: 10, borderWidth: 1, borderColor: '#E1E8EE', marginTop: 10 }}>
                    <Text style={{ fontSize: 12, fontWeight: 'bold', color: '#00264D', marginBottom: 5 }}>Bitácora de seguridad:</Text>
                    
                    {caso.novedades && caso.novedades.length > 0 ? (
                      caso.novedades.map((nov, i) => (
                        <Text key={i} style={{ fontSize: 12, color: '#667788', borderLeftWidth: 2, borderLeftColor: '#003366', paddingLeft: 8, marginBottom: 6 }}>
                          {nov.mensaje} <Text style={{fontSize: 10, color: '#999'}}>- {nov.usuario?.nombre || 'Staff'}</Text>
                        </Text>
                      ))
                    ) : (
                      <Text style={{ fontSize: 12, color: '#667788', borderLeftWidth: 2, borderLeftColor: '#003366', paddingLeft: 8 }}>
                        Reporte recibido. A la espera de revisión.
                      </Text>
                    )}
                  </View>

                </View>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
};

// --- 2. PANTALLA INICIO VIGILANTE ---
function InicioVigilante({ usuario }) {
  const [modalVisible, setModalVisible] = useState(false);
  const [casos, setCasos] = useState([]);
  const [modalMisCasosVisible, setModalMisCasosVisible] = useState(false);
  const [misCasos, setMisCasos] = useState([]);
  
  // NUEVO ESTADO para enviar novedades
  const [nuevaNovedad, setNuevaNovedad] = useState('');

  const DOMINIO = 'https://saferesidenceapp-production.up.railway.app';

  const cargarCasosActivos = async () => {
    try {
      const respuesta = await fetch(`${DOMINIO}/api/reportes/activos`);
      if (!respuesta.ok) throw new Error('Error de servidor');
      const datos = await respuesta.json();
      setCasos(datos);
      setModalVisible(true);
    } catch (error) {
      Alert.alert('Error de conexión', 'No se pudieron cargar los casos activos.');
    }
  };

  const cargarMisCasos = async () => {
    try {
      const respuesta = await fetch(`${DOMINIO}/api/reportes/vigilante/${usuario?.id}`);
      if (!respuesta.ok) throw new Error('Error de servidor');
      const datos = await respuesta.json();
      setMisCasos(datos);
      setModalMisCasosVisible(true);
    } catch (error) {
      Alert.alert('Error de conexión', 'No se pudieron cargar tus casos en proceso.');
    }
  };

  const tomarCaso = async (idReporte) => {
    if (!usuario?.id) return Alert.alert('Error', 'No se pudo identificar las credenciales.');
    try {
      const respuesta = await fetch(`${DOMINIO}/api/reportes/${idReporte}/tomar`, {
        method: 'POST',
        headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' },
        body: JSON.stringify({ vigilante_id: usuario.id })
      });
      if (respuesta.ok) {
        Alert.alert('Éxito', 'Has tomado este caso. Está en proceso.');
        setModalVisible(false);
      } else {
        Alert.alert('Error', 'No se pudo tomar el caso.');
      }
    } catch (error) {
      Alert.alert('Error', 'No se pudo conectar al servidor.');
    }
  };

  // NUEVA FUNCIÓN: Enviar Novedad (Solo en "Mis Casos")
  const enviarNovedad = async (idReporte) => {
    if (!nuevaNovedad) return Alert.alert('Atención', 'Escribe una novedad primero.');
    try {
      const respuesta = await fetch(`${DOMINIO}/api/reportes/${idReporte}/novedad`, {
        method: 'POST',
        headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: usuario.id, mensaje: nuevaNovedad })
      });
      if (respuesta.ok) {
        setNuevaNovedad('');
        cargarMisCasos(); // Refrescar para ver el mensaje recién enviado
      }
    } catch (error) {
      Alert.alert('Error', 'No se pudo enviar la actualización.');
    }
  };

  const formatearFecha = (fechaCruda) => {
    if (!fechaCruda) return '';
    let fechaCorregida = fechaCruda;
    if (!fechaCruda.includes('T')) fechaCorregida = fechaCruda.replace(' ', 'T') + 'Z';
    const fecha = new Date(fechaCorregida);
    return fecha.toLocaleString('es-CO', {
      timeZone: 'America/Bogota', year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', hour12: true 
    });
  };

  return (
    <View style={styles.mainContainer}>
      <View style={styles.deepHeader}>
        <View style={{flexDirection: 'row', alignItems: 'center'}}>
          <View style={[styles.profileOptionIconContainer, {marginRight: 15, backgroundColor: 'rgba(255,255,255,0.2)'}]}>
            <Ionicons name="shield" size={24} color="#FFF" />
          </View>
          <View>
            <Text style={styles.headerGreeting}>Guardia {usuario?.nombre || ''} 👮</Text>
            <Text style={styles.headerSubtitle}>Centro de Control y Novedades</Text>
          </View>
        </View>
      </View>
      <View style={styles.headerCurve} />

      <ScrollView contentContainerStyle={styles.bodyContent} showsVerticalScrollIndicator={false}>
        <View style={[styles.actionBlock, { marginTop: 15 }]}>
          <TouchableOpacity style={styles.actionRow} activeOpacity={0.7} onPress={cargarCasosActivos}>
            <View style={styles.profileOptionIconContainer}><Ionicons name="warning" size={24} color="#00264D" /></View>
            <View style={styles.actionTextGroup}>
              <Text style={styles.profileOptionTitle}>Casos Activos</Text>
              <Text style={styles.actionDesc}>Alertas sin asignar</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#CCC" />
          </TouchableOpacity>
          <View style={styles.separator} />
          <TouchableOpacity style={styles.actionRow} activeOpacity={0.7} onPress={cargarMisCasos}>
            <View style={styles.profileOptionIconContainer}><Ionicons name="shield-checkmark" size={24} color="#00264D" /></View>
            <View style={styles.actionTextGroup}>
              <Text style={styles.profileOptionTitle}>Mis Casos</Text>
              <Text style={styles.actionDesc}>Novedades en proceso</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#CCC" />
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* MODAL: CASOS ACTIVOS (Sin cambios) */}
      <Modal animationType="slide" transparent={true} visible={modalVisible}>
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', paddingTop: 50 }}>
          <View style={{ flex: 1, backgroundColor: '#FFF', borderTopLeftRadius: 25, borderTopRightRadius: 25, padding: 20 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 15, alignItems: 'center' }}>
              <Text style={{ fontSize: 20, fontWeight: 'bold', color: '#003366' }}>Alertas Abiertas</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}><Ionicons name="close-circle" size={28} color="#666" /></TouchableOpacity>
            </View>
            <ScrollView showsVerticalScrollIndicator={false}>
              {casos.length === 0 ? <Text style={{textAlign: 'center', marginTop: 20, color: '#666'}}>No hay casos activos ✅</Text> : null}
              {casos.map((caso) => (
                <View key={caso.id} style={{ backgroundColor: '#FFF4E5', padding: 18, borderRadius: 15, marginBottom: 18, borderWidth: 1, borderColor: '#FFE0B2', borderLeftWidth: 5, borderLeftColor: '#FF9500' }}>
                  <Text style={{ fontWeight: 'bold', fontSize: 16, color: '#00264D' }}>{caso.categoria} - {caso.titulo}</Text>
                  <Text style={{ fontSize: 13, color: '#666', marginTop: 5 }}>📍 Lugar: {caso.area_comun ? caso.area_comun : `T${caso.torre_incidente} - Apto ${caso.apartamento_incidente}`}</Text>
                  <Text style={{ fontSize: 13, color: '#666' }}>👤 Por: {caso.residente?.nombre || 'Anónimo'}</Text>
                  <Text style={{ fontSize: 12, color: '#888', marginVertical: 4, fontStyle: 'italic' }}>🕒 Reportado: {formatearFecha(caso.fecha)}</Text>
                  <Text style={{ fontSize: 14, marginBottom: 15, color: '#333' }}>"{caso.descripcion}"</Text>
                  
                  <TouchableOpacity style={[styles.btnGuardar, {backgroundColor: '#34C759', paddingVertical: 12, marginTop: 0}]} onPress={() => tomarCaso(caso.id)}>
                    <Text style={styles.btnTexto}>Atender Caso</Text>
                  </TouchableOpacity>
                </View>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* MODAL: MIS CASOS (Actualizado para enviar novedades) */}
      <Modal animationType="slide" transparent={true} visible={modalMisCasosVisible}>
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', paddingTop: 50 }}>
          <View style={{ flex: 1, backgroundColor: '#FFF', borderTopLeftRadius: 25, borderTopRightRadius: 25, padding: 20 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 15, alignItems: 'center' }}>
              <Text style={{ fontSize: 20, fontWeight: 'bold', color: '#003366' }}>Mis Casos en Proceso</Text>
              <TouchableOpacity onPress={() => setModalMisCasosVisible(false)}><Ionicons name="close-circle" size={28} color="#666" /></TouchableOpacity>
            </View>
            <ScrollView showsVerticalScrollIndicator={false}>
              {misCasos.length === 0 ? <Text style={{textAlign: 'center', marginTop: 20, color: '#666'}}>No tienes casos asignados actualmente. 🛡️</Text> : null}
              {misCasos.map((caso) => (
                <View key={caso.id} style={{ backgroundColor: '#E5F9E7', padding: 18, borderRadius: 15, marginBottom: 18, borderWidth: 1, borderColor: '#C8E6C9', borderLeftWidth: 5, borderLeftColor: '#34C759' }}>
                  <Text style={{ fontWeight: 'bold', fontSize: 16, color: '#00264D' }}>{caso.categoria} - {caso.titulo}</Text>
                  <Text style={{ fontSize: 13, color: '#666', marginTop: 5 }}>📍 Lugar: {caso.area_comun ? caso.area_comun : `T${caso.torre_incidente} - Apto ${caso.apartamento_incidente}`}</Text>
                  <Text style={{ fontSize: 12, color: '#888', marginVertical: 4, fontStyle: 'italic' }}>🕒 Asignado: {formatearFecha(caso.fecha)}</Text>
                  <Text style={{ fontSize: 14, marginVertical: 10, color: '#333' }}>"{caso.descripcion}"</Text>
                  
                  {/* VER NOVEDADES */}
                  <View style={{ backgroundColor: '#FFF', padding: 10, borderRadius: 8, borderWidth: 1, borderColor: '#C8E6C9', marginBottom: 10 }}>
                    <Text style={{ fontSize: 12, fontWeight: 'bold', color: '#00264D', marginBottom: 5 }}>Actualizaciones del caso:</Text>
                    {caso.novedades && caso.novedades.length > 0 ? (
                      caso.novedades.map((nov, i) => (
                        <Text key={i} style={{ fontSize: 12, color: '#555', marginBottom: 3 }}>
                          <Text style={{fontWeight: 'bold'}}>{nov.usuario?.nombre || 'Staff'}: </Text>{nov.mensaje}
                        </Text>
                      ))
                    ) : <Text style={{ fontSize: 12, color: '#999', fontStyle: 'italic' }}>Sin novedades registradas.</Text>}
                  </View>

                  {/* INGRESAR NUEVA NOVEDAD */}
                  <View style={{flexDirection: 'row', alignItems: 'center'}}>
                    <TextInput style={[styles.input, {flex: 1, marginBottom: 0, height: 45, paddingVertical: 10, fontSize: 13}]} placeholder="Registrar novedad..." value={nuevaNovedad} onChangeText={setNuevaNovedad} />
                    <TouchableOpacity style={{backgroundColor: '#003366', padding: 10, borderRadius: 10, marginLeft: 5}} onPress={() => enviarNovedad(caso.id)}>
                      <Ionicons name="add" size={18} color="#FFF" />
                    </TouchableOpacity>
                  </View>
                  
                </View>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}

// --- 3. PANTALLA INICIO ADMINISTRADOR ---
function InicioAdmin({ usuario }) {
  const [modalVisible, setModalVisible] = useState(false);
  const [casos, setCasos] = useState([]);
  const [modalDirectorio, setModalDirectorio] = useState(false);
  const [residentes, setResidentes] = useState([]);
  const [nuevaNovedad, setNuevaNovedad] = useState(''); 

  // Estados para el formulario de cierre y llamados de atención
  const [modalCierre, setModalCierre] = useState(false);
  const [datosCierre, setDatosCierre] = useState({ idReporte: null, solucion: '', aplicarLlamado: false, torre: '', apto: '' });

  const DOMINIO = 'https://saferesidenceapp-production.up.railway.app';

  const cargarTodosLosCasos = async () => {
    try {
      const respuesta = await fetch(`${DOMINIO}/api/reportes/todos`);
      if (!respuesta.ok) throw new Error('Error al obtener los casos');

      let datos = await respuesta.json();

      // LÓGICA DE ORDENAMIENTO: Activos primero, luego cerrados, ordenados de más nuevo a más viejo
      datos = datos.sort((a, b) => {
        const cerradoA = (a.estado === 'Resuelto' || a.estado === 'Terminado') ? 1 : 0;
        const cerradoB = (b.estado === 'Resuelto' || b.estado === 'Terminado') ? 1 : 0;
        if (cerradoA !== cerradoB) return cerradoA - cerradoB;
        return new Date(b.fecha) - new Date(a.fecha);
      });

      setCasos(datos);
      setModalVisible(true);
    } catch (error) {
      Alert.alert('Error', 'No se pudieron cargar los casos globales del servidor.');
    }
  };

  // Abre el modal para redactar la conclusión y aplicar sanciones
  const abrirModalCierre = (idReporte) => {
    setDatosCierre({ idReporte, solucion: '', aplicarLlamado: false, torre: '', apto: '' });
    setModalCierre(true);
  };

  // Envía los datos de finalización a Laravel
  const confirmarCierre = async () => {
    if (!datosCierre.solucion) return Alert.alert('Atención', 'Debes registrar la conclusión del caso.');
    if (datosCierre.aplicarLlamado && (!datosCierre.torre || !datosCierre.apto)) {
      return Alert.alert('Atención', 'Ingresa la torre y apartamento a sancionar.');
    }

    try {
      const respuesta = await fetch(`${DOMINIO}/api/reportes/${datosCierre.idReporte}/cerrar`, {
        method: 'PUT',
        headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' },
        body: JSON.stringify({
          admin_id: usuario.id,
          solucion: datosCierre.solucion,
          aplicar_llamado: datosCierre.aplicarLlamado,
          torre: datosCierre.torre,
          apto: datosCierre.apto
        })
      });

      const resultado = await respuesta.json();
      
      if (respuesta.ok) {
        Alert.alert('Caso Cerrado', resultado.mensaje);
        setModalCierre(false);
        cargarTodosLosCasos(); 
      } else {
        Alert.alert('Aviso', resultado.mensaje || 'Hubo un error.');
      }
    } catch (error) {
      Alert.alert('Error', 'No se pudo conectar al servidor.');
    }
  };

  const enviarNovedad = async (idReporte) => {
    if (!nuevaNovedad) return Alert.alert('Atención', 'Escribe una novedad primero.');
    try {
      const respuesta = await fetch(`${DOMINIO}/api/reportes/${idReporte}/novedad`, {
        method: 'POST',
        headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: usuario.id, mensaje: nuevaNovedad })
      });
      if (respuesta.ok) {
        setNuevaNovedad('');
        cargarTodosLosCasos(); 
      }
    } catch (error) {
      Alert.alert('Error', 'No se pudo enviar la actualización.');
    }
  };

  // Carga el Directorio de usuarios desde la base de datos
  const cargarDirectorio = async () => {
    try {
      const respuesta = await fetch(`${DOMINIO}/api/directorio`);
      if (!respuesta.ok) throw new Error('Error al obtener el directorio');

      const datos = await respuesta.json();
      setResidentes(datos);
      setModalDirectorio(true);
    } catch (error) {
      Alert.alert('Error', 'No se pudo conectar al directorio de residentes.');
    }
  };

  const formatearFecha = (fechaCruda) => {
    if (!fechaCruda) return '';
    let fechaCorregida = fechaCruda;
    if (!fechaCruda.includes('T')) fechaCorregida = fechaCruda.replace(' ', 'T') + 'Z';
    const fecha = new Date(fechaCorregida);
    return fecha.toLocaleString('es-CO', {
      timeZone: 'America/Bogota', year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', hour12: true 
    });
  };

  return (
    <View style={styles.mainContainer}>
      <View style={styles.deepHeader}>
        <View style={{flexDirection: 'row', alignItems: 'center'}}>
          <View style={[styles.profileOptionIconContainer, {marginRight: 15, backgroundColor: 'rgba(255,255,255,0.2)'}]}>
            <Ionicons name="business" size={24} color="#FFF" />
          </View>
          <View>
            <Text style={styles.headerGreeting}>Admin {usuario?.nombre || ''} 🏢</Text>
            <Text style={styles.headerSubtitle}>Panel de Gestión Global</Text>
          </View>
        </View>
      </View>
      <View style={styles.headerCurve} />

      <ScrollView contentContainerStyle={styles.bodyContent} showsVerticalScrollIndicator={false}>
        <View style={[styles.actionBlock, { marginTop: 15 }]}>
          
          {/* BOTÓN 1: VER TODOS LOS CASOS */}
          <TouchableOpacity style={styles.actionRow} activeOpacity={0.7} onPress={cargarTodosLosCasos}>
            <View style={styles.profileOptionIconContainer}><Ionicons name="folder-open" size={24} color="#00264D" /></View>
            <View style={styles.actionTextGroup}>
              <Text style={styles.profileOptionTitle}>Ver Todos los Casos</Text>
              <Text style={styles.actionDesc}>Historial y estados</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#CCC" />
          </TouchableOpacity>

          <View style={styles.separator} />

          {/* BOTÓN 2: RESTAURADO EL DIRECTORIO DE RESIDENTES */}
          <TouchableOpacity style={styles.actionRow} activeOpacity={0.7} onPress={cargarDirectorio}>
            <View style={styles.profileOptionIconContainer}><Ionicons name="people" size={24} color="#00264D" /></View>
            <View style={styles.actionTextGroup}>
              <Text style={styles.profileOptionTitle}>Directorio de Residentes</Text>
              <Text style={styles.actionDesc}>Contactos y reportes</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#CCC" />
          </TouchableOpacity>

        </View>
      </ScrollView>

      {/* --- MODAL 1: HISTORIAL DE TODOS LOS CASOS --- */}
      <Modal animationType="slide" transparent={true} visible={modalVisible}>
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', paddingTop: 50 }}>
          <View style={{ flex: 1, backgroundColor: '#FFF', borderTopLeftRadius: 25, borderTopRightRadius: 25, padding: 20 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 15, alignItems: 'center' }}>
              <Text style={{ fontSize: 20, fontWeight: 'bold', color: '#003366' }}>Historial Global</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}><Ionicons name="close-circle" size={28} color="#666" /></TouchableOpacity>
            </View>
            <ScrollView showsVerticalScrollIndicator={false}>
              {casos.length === 0 ? <Text style={{textAlign: 'center', marginTop: 20, color: '#666'}}>No se registran casos en el sistema</Text> : null}
              {casos.map((caso) => {
                const esCerrado = caso.estado === 'Resuelto' || caso.estado === 'Terminado';
                return (
                  <View key={caso.id} style={{ backgroundColor: '#F8F9FA', padding: 18, borderRadius: 15, marginBottom: 18, borderWidth: 1, borderColor: '#E1E8EE', borderLeftWidth: 5, borderLeftColor: esCerrado ? '#666' : '#FF9500' }}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Text style={{ fontWeight: 'bold', fontSize: 16, color: '#00264D' }}>{caso.titulo}</Text>
                      <Text style={{ fontWeight: 'bold', fontSize: 12, color: esCerrado ? '#666' : '#FF9500' }}>{caso.estado?.toUpperCase() || 'PENDIENTE'}</Text>
                    </View>
                    <Text style={{ fontSize: 12, color: '#666', marginTop: 5 }}>📍 {caso.area_comun ? caso.area_comun : `T${caso.torre_incidente} - Apto ${caso.apartamento_incidente}`}</Text>
                    {caso.fecha && <Text style={{ fontSize: 11, color: '#888', fontStyle: 'italic' }}>🕒 Registro: {formatearFecha(caso.fecha)}</Text>}
                    <Text style={{ fontSize: 14, color: '#333', marginTop: 10, marginBottom: 10 }}>{caso.descripcion}</Text>

                    {/* SECCIÓN DE NOVEDADES */}
                    <View style={{ backgroundColor: '#FFF', padding: 10, borderRadius: 8, borderWidth: 1, borderColor: '#E1E8EE', marginBottom: 10 }}>
                      <Text style={{ fontSize: 12, fontWeight: 'bold', color: '#00264D', marginBottom: 5 }}>Actualizaciones:</Text>
                      {caso.novedades && caso.novedades.length > 0 ? (
                        caso.novedades.map((nov, i) => (
                          <Text key={i} style={{ fontSize: 12, color: nov.mensaje.includes('DECISIÓN') ? '#00264D' : '#555', fontWeight: nov.mensaje.includes('DECISIÓN') ? 'bold' : 'normal', marginBottom: 3 }}>
                            <Text style={{fontWeight: 'bold'}}>{nov.usuario?.nombre || 'Staff'}: </Text>{nov.mensaje}
                          </Text>
                        ))
                      ) : <Text style={{ fontSize: 12, color: '#999', fontStyle: 'italic' }}>Sin actualizaciones aún.</Text>}
                    </View>

                    {/* OPERACIONES DE MENSAJERÍA Y CIERRE */}
                    {!esCerrado && (
                      <>
                        <View style={{flexDirection: 'row', alignItems: 'center', marginBottom: 10}}>
                          <TextInput style={[styles.input, {flex: 1, marginBottom: 0, height: 45, paddingVertical: 10, fontSize: 13}]} placeholder="Agregar novedad..." value={nuevaNovedad} onChangeText={setNuevaNovedad} />
                          <TouchableOpacity style={{backgroundColor: '#003366', padding: 10, borderRadius: 10, marginLeft: 5}} onPress={() => enviarNovedad(caso.id)}>
                            <Ionicons name="send" size={18} color="#FFF" />
                          </TouchableOpacity>
                        </View>
                        <TouchableOpacity style={[styles.btnGuardar, {backgroundColor: '#FF3B30', paddingVertical: 10, marginTop: 5}]} onPress={() => abrirModalCierre(caso.id)}>
                          <Text style={styles.btnTexto}>Finalizar Caso</Text>
                        </TouchableOpacity>
                      </>
                    )}
                  </View>
                );
              })}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* --- MODAL 2: FORMULARIO SECUNDARIO DE RESOLUCIÓN Y SANCIONES --- */}
      <Modal animationType="fade" transparent={true} visible={modalCierre}>
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', padding: 20 }}>
          <View style={{ backgroundColor: '#FFF', borderRadius: 20, padding: 25 }}>
            <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#003366', marginBottom: 15 }}>Conclusión del Caso</Text>
            
            <Text style={{ fontSize: 13, color: '#666', marginBottom: 5 }}>Resolución o medidas tomadas:</Text>
            <TextInput 
              style={[styles.input, { height: 80, textAlignVertical: 'top' }]} 
              placeholder="Ej: Se habló con el propietario y se comprometió a limpiar el pasillo." 
              multiline={true} 
              value={datosCierre.solucion} 
              onChangeText={(t) => setDatosCierre({...datosCierre, solucion: t})} 
            />

            <View style={{ flexDirection: 'row', alignItems: 'center', marginVertical: 15 }}>
              <TouchableOpacity 
                style={{ width: 24, height: 24, borderRadius: 5, borderWidth: 2, borderColor: '#003366', alignItems: 'center', justifyContent: 'center', marginRight: 10, backgroundColor: datosCierre.aplicarLlamado ? '#003366' : '#FFF' }}
                onPress={() => setDatosCierre({...datosCierre, aplicarLlamado: !datosCierre.aplicarLlamado})}
              >
                {datosCierre.aplicarLlamado && <Ionicons name="checkmark" size={18} color="#FFF" />}
              </TouchableOpacity>
              <Text style={{ fontSize: 14, color: '#333', fontWeight: 'bold' }}>Aplicar Llamado de Atención</Text>
            </View>

            {datosCierre.aplicarLlamado && (
              <View style={{flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10}}>
                <TextInput style={[styles.input, {width: '48%'}]} placeholder="Torre (1-20)" keyboardType="numeric" value={datosCierre.torre} onChangeText={(t) => setDatosCierre({...datosCierre, torre: t})} />
                <TextInput style={[styles.input, {width: '48%'}]} placeholder="Apto (101-1208)" keyboardType="numeric" value={datosCierre.apto} onChangeText={(t) => setDatosCierre({...datosCierre, apto: t})} />
              </View>
            )}

            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 10 }}>
              <TouchableOpacity style={{ padding: 15 }} onPress={() => setModalCierre(false)}>
                <Text style={{ color: '#666', fontWeight: 'bold' }}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity style={{ backgroundColor: '#FF3B30', paddingVertical: 12, paddingHorizontal: 20, borderRadius: 10 }} onPress={confirmarCierre}>
                <Text style={{ color: '#FFF', fontWeight: 'bold' }}>Confirmar Cierre</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* --- MODAL 3: DIRECTORIO COMPLETO DE RESIDENTES --- */}
      <Modal animationType="slide" transparent={true} visible={modalDirectorio}>
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', paddingTop: 50 }}>
          <View style={{ flex: 1, backgroundColor: '#FFF', borderTopLeftRadius: 25, borderTopRightRadius: 25, padding: 20 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 15, alignItems: 'center' }}>
              <Text style={{ fontSize: 20, fontWeight: 'bold', color: '#003366' }}>Directorio Oficial</Text>
              <TouchableOpacity onPress={() => setModalDirectorio(false)}><Ionicons name="close-circle" size={28} color="#666" /></TouchableOpacity>
            </View>
            <ScrollView showsVerticalScrollIndicator={false}>
              {residentes.length === 0 ? <Text style={{textAlign: 'center', marginTop: 20, color: '#666'}}>No hay residentes registrados en el sistema</Text> : null}
              {residentes.map((res) => (
                <View key={res.id} style={{ backgroundColor: '#F8F9FA', padding: 18, borderRadius: 15, marginBottom: 15, borderWidth: 1, borderColor: '#E1E8EE' }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 10 }}>
                    <Ionicons name="person-circle" size={40} color="#00264D" />
                    <View style={{ marginLeft: 10 }}>
                      <Text style={{ fontWeight: 'bold', fontSize: 16, color: '#00264D' }}>{res.nombre} {res.apellidos}</Text>
                      <Text style={{ fontSize: 13, color: '#666' }}>Torre {res.torre} - Apto {res.apartamento}</Text>
                    </View>
                  </View>
                  
                  {/* Visualización de Métricas de Conducta por Usuario */}
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', backgroundColor: '#FFF', padding: 10, borderRadius: 8, borderWidth: 1, borderColor: '#EEE' }}>
                    <View style={{ alignItems: 'center', flex: 1 }}>
                      <Text style={{ fontSize: 16, fontWeight: 'bold', color: '#34C759' }}>{res.casos_reportados}</Text>
                      <Text style={{ fontSize: 11, color: '#666', textAlign: 'center' }}>Reportados</Text>
                    </View>
                    <View style={{ width: 1, backgroundColor: '#EEE' }} />
                    <View style={{ alignItems: 'center', flex: 1 }}>
                      <Text style={{ fontSize: 16, fontWeight: 'bold', color: res.quejas_recibidas > 0 ? '#FF3B30' : '#666' }}>{res.quejas_recibidas}</Text>
                      <Text style={{ fontSize: 11, color: '#666', textAlign: 'center' }}>Llamados Recibidos</Text>
                    </View>
                  </View>
                  <Text style={{ fontSize: 12, color: '#888', marginTop: 10, textAlign: 'center' }}>📞 Teléfono: {res.celular}</Text>
                </View>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>

    </View>
  );
}

// --- 4. DIRECTOR DE TRÁFICO ---
function PantallaPrincipal({ usuario }) {
  // Evitamos el crash asegurándonos de que si el usuario no ha cargado, no intente leer .rol
  if (!usuario) return null; 

  const rolDelUsuario = usuario.rol ? usuario.rol.toLowerCase() : 'residente';

  if (rolDelUsuario === 'vigilante') {
    return <InicioVigilante usuario={usuario} />;
  } else if (rolDelUsuario === 'administrador') {
    return <InicioAdmin usuario={usuario} />;
  } else {
    return <InicioResidente usuario={usuario} />;
  }
}

// --- 5. PANTALLA PERFIL (ACTUALIZACIÓN EN TIEMPO REAL) ---
function PantallaPerfil({ usuario, setUsuario }) {
  const rol = usuario.rol ? usuario.rol.toUpperCase() : 'RESIDENTE';
  const [modalQuejasVisible, setModalQuejasVisible] = useState(false);
  const [llamados, setLlamados] = useState([]); 
  const [errorLlamados, setErrorLlamados] = useState(false); 
  const [modalVisible, setModalVisible] = useState(false); 
  const [passwords, setPasswords] = useState({ actual: '', nueva: '', confirmar: '' });
  
  const DOMINIO = 'https://saferesidenceapp-production.up.railway.app';

  // Función encargada de sincronizar los llamados con la base de datos de Laravel
  const consultarLlamadosAtencion = async () => {
    try {
      const respuesta = await fetch(`${DOMINIO}/api/usuarios/${usuario.id}/llamados`);
      
      if (!respuesta.ok) {
        setErrorLlamados(true); 
      } else {
        const datos = await respuesta.json();
        setLlamados(datos);
        setErrorLlamados(false); 
      }
    } catch (error) {
      setErrorLlamados(true); 
    } 
  };

  // EFECTO EN TIEMPO REAL: Cada vez que la pestaña Perfil se enfoca, actualiza los llamados
  useFocusEffect(
    useCallback(() => {
      if (rol === 'RESIDENTE') {
        consultarLlamadosAtencion();
      }
    }, [])
  );

  // El botón ahora simplemente abre el modal de forma instantánea porque los datos ya están precargados
  const abrirModalLlamados = () => {
    setModalQuejasVisible(true);
  };

  // Enviar cambio de contraseña real a Laravel
  const cambiarContraseña = async () => {
    if (!passwords.actual || !passwords.nueva || !passwords.confirmar) {
      return Alert.alert('Atención', 'Por favor llena todos los campos.');
    }
    if (passwords.nueva !== passwords.confirmar) {
      return Alert.alert('Error', 'La nueva contraseña no coincide con la confirmación.');
    }

    try {
      const respuesta = await fetch(`${DOMINIO}/api/usuarios/${usuario.id}/cambiar-password`, {
        method: 'POST',
        headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' },
        body: JSON.stringify({
          password_actual: passwords.actual,
          password_nueva: passwords.nueva,
          password_nueva_confirmation: passwords.confirmar 
        })
      });

      const resultado = await respuesta.json();

      if (respuesta.ok) {
        Alert.alert('Éxito', 'Contraseña actualizada correctamente.');
        setModalVisible(false);
        setPasswords({ actual: '', nueva: '', confirmar: '' });
      } else {
        Alert.alert('Error', resultado.message || 'No se pudo actualizar la contraseña.');
      }
    } catch (error) {
      Alert.alert('Error de conexión', 'No se pudo comunicar con el servidor.');
    }
  };

  return (
    <View style={styles.mainContainer}>
      <View style={[styles.deepHeader, { alignItems: 'center' }]}>
        <Ionicons name="person-circle" size={100} color="#FFFFFF" />
        <Text style={styles.profileHeaderName}>{usuario.nombre} {usuario.apellidos}</Text>
        <Text style={styles.profileHeaderRoleTag}>{rol}</Text>
        {rol === 'RESIDENTE' && <Text style={styles.headerSubtitle}>Torre {usuario.torre} - Apto {usuario.apartamento}</Text>}
      </View>
      <View style={styles.headerCurve} />
      
      <ScrollView contentContainerStyle={styles.bodyContent} showsVerticalScrollIndicator={false}>
        <View style={[styles.actionBlock, { marginTop: 15 }]}>
          
          {/* BOTÓN LLAMADOS DE ATENCIÓN */}
          {rol === 'RESIDENTE' && (
            <>
              <TouchableOpacity style={styles.actionRow} activeOpacity={0.7} onPress={abrirModalLlamados}>
                <View style={styles.profileOptionIconContainer}><Ionicons name="warning" size={24} color="#00264D" /></View>
                <View style={styles.actionTextGroup}>
                  <Text style={styles.profileOptionTitle}>Llamados de Atención</Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#CCC" />
              </TouchableOpacity>
              <View style={styles.separator} />
            </>
          )}

          {/* BOTÓN SEGURIDAD (CONTRASEÑA) */}
          <TouchableOpacity style={styles.actionRow} activeOpacity={0.7} onPress={() => setModalVisible(true)}>
            <View style={styles.profileOptionIconContainer}><Ionicons name="lock-closed" size={24} color="#00264D" /></View>
            <View style={styles.actionTextGroup}>
              <Text style={styles.profileOptionTitle}>Seguridad (Contraseña)</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#CCC" />
          </TouchableOpacity>
        </View>
        
        {/* BOTÓN CERRAR SESIÓN */}
        <View style={[styles.actionBlock, { marginTop: 25 }]}>
          <TouchableOpacity style={styles.actionRow} activeOpacity={0.7} onPress={() => setUsuario(null)}>
            <View style={[styles.profileOptionIconContainer, { backgroundColor: '#FFEDED' }]}><Ionicons name="log-out" size={24} color="#FF3B30" /></View>
            <View style={styles.actionTextGroup}>
              <Text style={[styles.profileOptionTitle, { color: '#FF3B30' }]}>Cerrar Sesión</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#CCC" />
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* --- MODAL: LLAMADOS DE ATENCIÓN --- */}
      <Modal animationType="slide" transparent={true} visible={modalQuejasVisible}>
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', paddingTop: 100 }}>
          <View style={{ flex: 1, backgroundColor: '#FFF', borderTopLeftRadius: 25, borderTopRightRadius: 25, padding: 25 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20, alignItems: 'center' }}>
              <Text style={{ fontSize: 20, fontWeight: 'bold', color: '#003366' }}>Llamados de Atención</Text>
              <TouchableOpacity onPress={() => setModalQuejasVisible(false)}><Ionicons name="close-circle" size={28} color="#666" /></TouchableOpacity>
            </View>
            
            <ScrollView showsVerticalScrollIndicator={false}>
              {errorLlamados ? (
                <View style={{ alignItems: 'center', marginTop: 30 }}>
                  <Ionicons name="cloud-offline" size={50} color="#FF3B30" />
                  <Text style={{textAlign: 'center', marginTop: 10, color: '#FF3B30', fontWeight: 'bold'}}>No se pudo conectar al servidor.</Text>
                  <Text style={{textAlign: 'center', marginTop: 5, color: '#666', fontSize: 13}}>No pudimos verificar tus llamados de atención en este momento.</Text>
                </View>
              ) : llamados.length === 0 ? (
                <View style={{ alignItems: 'center', marginTop: 30 }}>
                  <Text style={{fontSize: 40}}>🎉</Text>
                  <Text style={{textAlign: 'center', marginTop: 15, color: '#003366', fontWeight: 'bold', fontSize: 16}}>¡Buen comportamiento!</Text>
                  <Text style={{textAlign: 'center', marginTop: 5, color: '#666', fontSize: 14}}>No tienes llamados de atención registrados en tu apartamento.</Text>
                </View>
              ) : (
                llamados.map((queja) => (
                  <View key={queja.id} style={{ backgroundColor: '#F2F6FA', padding: 18, borderRadius: 15, marginBottom: 15, borderLeftWidth: 5, borderLeftColor: '#003366' }}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 5 }}>
                      <Text style={{ fontWeight: 'bold', color: '#003366' }}>{queja.fecha}</Text>
                      <Text style={{ fontWeight: 'bold', color: '#FF3B30', fontSize: 12 }}>{queja.estado?.toUpperCase()}</Text>
                    </View>
                    <Text style={{ fontSize: 15, color: '#333' }}>{queja.motivo}</Text>
                  </View>
                ))
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* --- MODAL: CAMBIAR CONTRASEÑA --- */}
      <Modal animationType="fade" transparent={true} visible={modalVisible}>
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: 20 }}>
          <View style={{ backgroundColor: '#FFF', borderRadius: 20, padding: 25 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 }}>
              <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#003366' }}>Seguridad de Cuenta</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}><Ionicons name="close-circle" size={28} color="#666" /></TouchableOpacity>
            </View>

            <Text style={{ fontSize: 13, color: '#666', marginBottom: 15 }}>Por seguridad, primero ingresa tu contraseña actual.</Text>

            <TextInput style={styles.input} placeholder="Contraseña Actual" secureTextEntry={true} value={passwords.actual} onChangeText={(t) => setPasswords({...passwords, actual: t})} />
            <TextInput style={styles.input} placeholder="Nueva Contraseña" secureTextEntry={true} value={passwords.nueva} onChangeText={(t) => setPasswords({...passwords, nueva: t})} />
            <TextInput style={styles.input} placeholder="Confirmar Nueva Contraseña" secureTextEntry={true} value={passwords.confirmar} onChangeText={(t) => setPasswords({...passwords, confirmar: t})} />

            <TouchableOpacity style={styles.btnGuardar} onPress={cambiarContraseña}>
              <Text style={styles.btnTexto}>Actualizar Contraseña</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

// --- 6. MURO DE AUTENTICACIÓN ---
function PantallaAuth({ setUsuario }) {
  const [esRegistro, setEsRegistro] = useState(false); 
  const [datos, setDatos] = useState({ nombre: '', apellidos: '', correo: '', celular: '', torre: '', apartamento: '', cedula: '', password: '', rol: 'residente' });

  const procesarFormulario = async () => {
    try {
      const DOMINIO = 'https://saferesidenceapp-production.up.railway.app'; 
      const endpoint = esRegistro ? '/api/registro' : '/api/login';
      const respuesta = await fetch(`${DOMINIO}${endpoint}`, {
        method: 'POST',
        headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' },
        body: JSON.stringify(datos)
      });
      const resultado = await respuesta.json();
      if (respuesta.ok) setUsuario(resultado.usuario);
      else Alert.alert('Error', resultado.message || 'Verifica los datos ingresados.');
    } catch (error) {
      Alert.alert('Error', 'No se pudo conectar al servidor.');
    }
  };

  return (
    <ScrollView 
      contentContainerStyle={[styles.authContainer, { paddingBottom: esRegistro ? 150 : 80 }]} 
      showsVerticalScrollIndicator={false}
    >
      <View style={{ alignItems: 'center', marginBottom: 30 }}>
        <View style={styles.logoContainer}>
          <Ionicons name="business" size={60} color="#FFFFFF" />
        </View>
        <Text style={styles.authTitle}>{esRegistro ? 'Crear Cuenta' : 'Iniciar Sesión'}</Text>
        <Text style={styles.authSubtitle}>SafeResidence App</Text>
      </View>

      <View style={styles.authFormBlock}>
        {esRegistro && (
          <>
            <Text style={styles.authLabel}>Selecciona tu función:</Text>
            <View style={styles.rolSelector}>
              {['residente', 'vigilante', 'administrador'].map((opcion) => (
                <TouchableOpacity key={opcion} style={[styles.btnRol, datos.rol === opcion && styles.btnRolActivo]} onPress={() => setDatos({...datos, rol: opcion})}>
                  <Text style={[styles.txtRol, datos.rol === opcion && styles.txtRolActivo]}>
                    {opcion.charAt(0).toUpperCase() + opcion.slice(1)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <TextInput style={styles.input} placeholder="Nombre" value={datos.nombre} onChangeText={(t) => setDatos({...datos, nombre: t})} />
            <TextInput style={styles.input} placeholder="Apellidos" value={datos.apellidos} onChangeText={(t) => setDatos({...datos, apellidos: t})} />
            <TextInput style={styles.input} placeholder="Celular" keyboardType="phone-pad" value={datos.celular} onChangeText={(t) => setDatos({...datos, celular: t})} />
            
            {datos.rol === 'residente' && (
              <View style={{flexDirection: 'row', justifyContent: 'space-between'}}>
                <TextInput style={[styles.input, {width: '48%'}]} placeholder="Torre (1-20)" keyboardType="numeric" value={datos.torre} onChangeText={(t) => setDatos({...datos, torre: t})} />
                <TextInput style={[styles.input, {width: '48%'}]} placeholder="Apto (Ej. 101)" keyboardType="numeric" value={datos.apartamento} onChangeText={(t) => setDatos({...datos, apartamento: t})} />
              </View>
            )}
            <TextInput style={styles.input} placeholder="Cédula" keyboardType="numeric" value={datos.cedula} onChangeText={(t) => setDatos({...datos, cedula: t})} />
          </>
        )}

        <TextInput style={styles.input} placeholder="Correo Electrónico" keyboardType="email-address" autoCapitalize="none" value={datos.correo} onChangeText={(t) => setDatos({...datos, correo: t})} />
        <TextInput style={styles.input} placeholder="Contraseña" secureTextEntry={true} value={datos.password} onChangeText={(t) => setDatos({...datos, password: t})} />

        <TouchableOpacity style={styles.btnGuardar} onPress={procesarFormulario}>
          <Text style={styles.btnTexto}>{esRegistro ? 'Registrarse' : 'Entrar'}</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={{ marginTop: 25, alignItems: 'center' }} onPress={() => setEsRegistro(!esRegistro)}>
        <Text style={{ color: '#003366', fontWeight: 'bold', fontSize: 15 }}>
          {esRegistro ? '¿Ya tienes cuenta? Inicia Sesión' : '¿No tienes cuenta? Regístrate'}
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

// --- 7. CONFIGURACIÓN PRINCIPAL ---
const Tab = createMaterialTopTabNavigator();

export default function App() {
  const [usuario, setUsuario] = useState(null);

  if (!usuario) {
    return <PantallaAuth setUsuario={setUsuario} />;
  }
  const insets = useSafeAreaInsets();
  return (
    <NavigationContainer>
      <Tab.Navigator
        tabBarPosition="bottom"
        screenOptions={({ route }) => ({
          tabBarIcon: ({ focused, color }) => {
            let iconName;
            if (route.name === 'Inicio') iconName = focused ? 'home' : 'home-outline';
            else if (route.name === 'Informes') iconName = focused ? 'bar-chart' : 'bar-chart-outline';
            else if (route.name === 'Histórico') iconName = focused ? 'time' : 'time-outline';
            else if (route.name === 'Perfil') iconName = focused ? 'person' : 'person-outline';
            return <Ionicons name={iconName} size={24} color={color} />;
          },
          tabBarActiveTintColor: '#003366',
          tabBarInactiveTintColor: '#8E8E93',
          tabBarShowIcon: true,
          swipeEnabled: true,
          tabBarIndicatorStyle: { backgroundColor: '#003366', height: 3, top: 0 },
          
          tabBarStyle: {
            backgroundColor: '#FFFFFF', 
            elevation: 10, 
            shadowColor: '#000', 
            shadowOffset: { width: 0, height: -2 },
            shadowOpacity: 0.1, 
            shadowRadius: 4, 
            height: 60 + insets.bottom, 
            paddingBottom: insets.bottom > 0 ? insets.bottom : 10, 
          },
          tabBarLabelStyle: { fontSize: 10, fontWeight: '600', textTransform: 'none', marginTop: 2 },
        })}
      >
        <Tab.Screen name="Inicio">{() => <PantallaPrincipal usuario={usuario} />}</Tab.Screen>
        <Tab.Screen name="Informes" component={PantallaInformes} />
        <Tab.Screen name="Histórico" component={PantallaHistorico} />
        <Tab.Screen name="Perfil">{() => <PantallaPerfil usuario={usuario} setUsuario={setUsuario} />}</Tab.Screen>
      </Tab.Navigator>
    </NavigationContainer>
  );
}

// --- 8. PANTALLA INFORMES SEMANALES (GRÁFICOS E INSIGHTS DINÁMICOS) ---
function PantallaInformes() {
  const [filtroActivo, setFiltroActivo] = useState('Categorias');
  const screenWidth = Dimensions.get('window').width - 80; 

  const [datosPastel, setDatosPastel] = useState([]);
  const [datosBarrasTorres, setDatosBarrasTorres] = useState({ labels: ['Cargando...'], datasets: [{ data: [0] }] });
  const [datosBarrasGuardias, setDatosBarrasGuardias] = useState({ labels: ['Cargando...'], datasets: [{ data: [0] }] });
  
  const [analisis, setAnalisis] = useState({
    categoriaTop: 'Sin datos',
    torreTop: 'Sin datos',
    guardiaTop: 'Sin datos'
  });

  const DOMINIO = 'https://saferesidenceapp-production.up.railway.app';

  const cargarMetricas = async () => {
    try {
      const respuesta = await fetch(`${DOMINIO}/api/metricas`);
      if (!respuesta.ok) throw new Error('Error al obtener métricas');
      const data = await respuesta.json();

      let catTop = 'Sin datos';
      const colores = ['#00264D', '#FF9500', '#34C759', '#007AFF', '#AF52DE'];
      
      // Procesar Categorías
      if (data.categorias && data.categorias.length > 0) {
        const pastelFormateado = data.categorias.map((item, index) => ({
          name: item.name,
          poblacion: item.poblacion,
          color: colores[index % colores.length],
          legendFontColor: '#333',
          legendFontSize: 12
        }));
        setDatosPastel(pastelFormateado);
        
        const maxCat = data.categorias.reduce((prev, current) => (prev.poblacion > current.poblacion) ? prev : current);
        catTop = maxCat.name;
      } else {
        setDatosPastel([]);
      }

      // Procesar Torres
      let torTop = 'Sin datos';
      if (data.torres && data.torres.length > 0) {
        setDatosBarrasTorres({
          labels: data.torres.map(t => `T${t.torre_incidente}`),
          datasets: [{ data: data.torres.map(t => t.total) }]
        });
        
        const maxTorre = data.torres.reduce((prev, current) => (prev.total > current.total) ? prev : current);
        torTop = `Torre ${maxTorre.torre_incidente}`;
      } else {
        setDatosBarrasTorres({ labels: ['Sin datos'], datasets: [{ data: [0] }] });
      }

      // Procesar Guardias
      let guarTop = 'Sin datos';
      if (data.guardias && data.guardias.length > 0) {
        setDatosBarrasGuardias({
          labels: data.guardias.map(g => g.etiqueta.split(' ')[0]), 
          datasets: [{ data: data.guardias.map(g => g.total) }]
        });
        
        const maxGuar = data.guardias.reduce((prev, current) => (prev.total > current.total) ? prev : current);
        guarTop = maxGuar.etiqueta.split(' ')[0];
      } else {
        setDatosBarrasGuardias({ labels: ['Sin datos'], datasets: [{ data: [0] }] });
      }

      setAnalisis({ categoriaTop: catTop, torreTop: torTop, guardiaTop: guarTop });

    } catch (error) {
      console.log('Error cargando métricas:', error);
    }
  };

  // REFRESCAR AL ENTRAR A LA PESTAÑA (useFocusEffect)
  useFocusEffect(
    React.useCallback(() => {
      cargarMetricas();
    }, [])
  );

  const chartConfig = {
    backgroundColor: '#FFF',
    backgroundGradientFrom: '#FFF',
    backgroundGradientTo: '#FFF',
    color: (opacity = 1) => `rgba(0, 38, 77, ${opacity})`, 
    labelColor: (opacity = 1) => `rgba(102, 119, 136, ${opacity})`,
    barPercentage: 0.6,
    decimalPlaces: 0,
    fillShadowGradient: '#00264D',           
    fillShadowGradientOpacity: 1,            
    fillShadowGradientFrom: '#00264D',       
    fillShadowGradientTo: '#00264D',         
    fillShadowGradientToOpacity: 1,          
  };

  return (
    <View style={styles.mainContainer}>
      <View style={[styles.deepHeader, { paddingBottom: 20 }]}>
        <View style={{flexDirection: 'row', alignItems: 'center'}}>
          <View style={[styles.profileOptionIconContainer, {marginRight: 15, backgroundColor: 'rgba(255,255,255,0.2)'}]}><Ionicons name="stats-chart" size={24} color="#FFF" /></View>
          <View>
            <Text style={styles.headerGreeting}>Métricas</Text>
            <Text style={styles.headerSubtitle}>Informes Semanales</Text>
          </View>
        </View>
      </View>
      <View style={styles.headerCurve} />

      <ScrollView contentContainerStyle={styles.bodyContent} showsVerticalScrollIndicator={false}>
        
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 20 }}>
          {['Categorias', 'Torres', 'Guardias'].map((filtro) => (
            <TouchableOpacity 
              key={filtro} 
              style={[styles.filterBtn, filtroActivo === filtro && styles.filterBtnActive]}
              onPress={() => setFiltroActivo(filtro)}
            >
              <Text style={[styles.filterText, filtroActivo === filtro && styles.filterTextActive]}>{filtro}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <View style={styles.actionBlock}>
          <Text style={{ fontSize: 16, fontWeight: 'bold', color: '#00264D', marginBottom: 15, paddingHorizontal: 20, paddingTop: 20 }}>
            {filtroActivo === 'Categorias' && 'Distribución por Categoría'}
            {filtroActivo === 'Torres' && 'Torres con más Infracciones'}
            {filtroActivo === 'Guardias' && 'Casos Resueltos por Guardia'}
          </Text>

          <View style={{ alignItems: 'center', paddingBottom: 20 }}>
            {filtroActivo === 'Categorias' ? (
              datosPastel.length > 0 ? (
                <PieChart
                  data={datosPastel}
                  width={screenWidth + 40}
                  height={200}
                  chartConfig={chartConfig}
                  accessor={"poblacion"}
                  backgroundColor={"transparent"}
                  paddingLeft={"10"}
                  absolute 
                />
              ) : <Text style={{color: '#666', padding: 40, fontStyle: 'italic'}}>No hay datos registrados al momento 📊</Text>
            ) : (
              (filtroActivo === 'Torres' ? datosBarrasTorres : datosBarrasGuardias).labels[0] === 'Sin datos' ? (
                <Text style={{color: '#666', padding: 40, fontStyle: 'italic'}}>No hay datos registrados al momento 📊</Text>
              ) : (
                <BarChart
                  data={filtroActivo === 'Torres' ? datosBarrasTorres : datosBarrasGuardias}
                  width={screenWidth}
                  height={220}
                  chartConfig={chartConfig}
                  verticalLabelRotation={0}
                  showValuesOnTopOfBars={true}
                  fromZero={true}
                  style={{ borderRadius: 16 }}
                />
              )
            )}
          </View>
        </View>

        {/* CAJA DE ANÁLISIS DINÁMICO REVISADA CONTRA STRINGS EN BLANCO */}
        <View style={{ backgroundColor: '#E5F9E7', padding: 18, borderRadius: 15, marginTop: 20, borderWidth: 1, borderColor: '#C8E6C9' }}>
          <Text style={{ color: '#00264D', fontSize: 14, lineHeight: 22 }}>
            💡 <Text style={{fontWeight: 'bold'}}>Análisis rápido:</Text>{'\n'}
            {filtroActivo === 'Categorias' && (analisis.categoriaTop === 'Sin datos' ? 'No hay datos disponibles al momento para generar un análisis.' : `Actualmente, la categoría con mayor volumen de alertas es "${analisis.categoriaTop}". Se recomienda revisar los protocolos de esta área.`)}
            {filtroActivo === 'Torres' && (analisis.torreTop === 'Sin datos' ? 'No hay registros de incidentes por torres al momento.' : `La ${analisis.torreTop} presenta la mayor concentración de incidentes. Sería prudente aumentar las rondas de vigilancia en este sector.`)}
            {filtroActivo === 'Guardias' && (analisis.guardiaTop === 'Sin datos' ? 'No hay registros de actividad de guardias al momento.' : `El guardia ${analisis.guardiaTop} lidera la atención de casos en el sistema. Excelente tiempo de respuesta y gestión.`)}
          </Text>
        </View>

      </ScrollView>
    </View>
  );
}

// --- 9. PANTALLA HISTÓRICO ---
function PantallaHistorico() {
  const [casosConfirmados, setCasosConfirmados] = useState([]);
  
  // ESTADOS PARA LOS FILTROS
  const [filtroFecha, setFiltroFecha] = useState('');
  const [filtroEstado, setFiltroEstado] = useState('Todos'); 

  const DOMINIO = 'https://saferesidenceapp-production.up.railway.app';

  const cargarHistoricoGlobal = async () => {
    try {
      const respuesta = await fetch(`${DOMINIO}/api/reportes/todos`);
      if (!respuesta.ok) throw new Error('Error al obtener el historial');

      const datos = await respuesta.json();
      
      const datosFormateados = datos.map(item => {
        const fechaCorta = item.fecha ? item.fecha.split(' ')[0] : 'S/F';
        return {
          id: item.id.toString(),
          fecha: fechaCorta,
          caso: item.titulo,
          ubicacion: item.area_comun ? item.area_comun : `T${item.torre_incidente}-Apto ${item.apartamento_incidente}`,
          estado: item.estado || 'Abierto'
        };
      });

      setCasosConfirmados(datosFormateados);
    } catch (error) {
      console.log('Error cargando el histórico global:', error);
    }
  };

  useFocusEffect(
    React.useCallback(() => {
      cargarHistoricoGlobal();
    }, [])
  );

  // LÓGICA DE FILTRADO EN TIEMPO REAL
  const casosFiltrados = casosConfirmados.filter((item) => {
    // 1. Filtro por Fecha (Coincidencia parcial de texto)
    const cumpleFecha = filtroFecha === '' || item.fecha.includes(filtroFecha);
    
    // 2. Filtro por Estado
    const cumpleEstado = filtroEstado === 'Todos' || item.estado.toLowerCase() === filtroEstado.toLowerCase();

    return cumpleFecha && cumpleEstado;
  });

  return (
    <View style={styles.mainContainer}>
      <View style={[styles.deepHeader, { paddingBottom: 20 }]}>
        <View style={{flexDirection: 'row', alignItems: 'center'}}>
          <View style={[styles.profileOptionIconContainer, {marginRight: 15, backgroundColor: 'rgba(255,255,255,0.2)'}]}><Ionicons name="library" size={24} color="#FFF" /></View>
          <View>
            <Text style={styles.headerGreeting}>Histórico</Text>
            <Text style={styles.headerSubtitle}>Registro Oficial de Novedades</Text>
          </View>
        </View>
      </View>
      <View style={styles.headerCurve} />

      <ScrollView contentContainerStyle={styles.bodyContent} showsVerticalScrollIndicator={false}>
        
        {/* --- PANEL DE FILTROS REDISEÑADO --- */}
        <View style={{ backgroundColor: '#FFFFFF', padding: 18, borderRadius: 20, marginBottom: 20, shadowColor: '#003366', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 3 }}>
          
          <Text style={{ fontSize: 14, fontWeight: 'bold', color: '#00264D', marginBottom: 12 }}>Filtros de Búsqueda</Text>

          {/* Barra de búsqueda de fecha estilizada */}
          <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: '#F8F9FB', borderWidth: 1, borderColor: '#E1E8EE', borderRadius: 12, paddingHorizontal: 12, height: 45, marginBottom: 15 }}>
            <Ionicons name="search" size={20} color="#888" style={{ marginRight: 8 }} />
            <TextInput 
              style={{ flex: 1, fontSize: 14, color: '#333' }} 
              placeholder="Buscar por fecha (Ej. 2026-06-15)" 
              placeholderTextColor="#999"
              value={filtroFecha} 
              onChangeText={setFiltroFecha} 
              keyboardType="numeric"
            />
            {filtroFecha !== '' && (
              <TouchableOpacity onPress={() => setFiltroFecha('')} style={{ padding: 4 }}>
                <Ionicons name="close-circle" size={20} color="#CCC" />
              </TouchableOpacity>
            )}
          </View>

          {/* Botones de Estado tipo pastilla con flexWrap para evitar recortes */}
          <Text style={{ fontSize: 12, color: '#666', marginBottom: 8, marginLeft: 2 }}>Estado del caso:</Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
            {['Todos', 'Abierto', 'En Proceso', 'Resuelto'].map((estado) => (
              <TouchableOpacity 
                key={estado} 
                style={[
                  styles.filterBtn, 
                  { 
                    height: 38, // Altura optimizada para evitar recortes
                    justifyContent: 'center', // Centrado vertical estricto
                    alignItems: 'center',
                    paddingHorizontal: 16, 
                    borderRadius: 10, 
                    marginRight: 8, 
                    marginBottom: 8, 
                    borderWidth: 1, 
                    borderColor: filtroEstado === estado ? '#00264D' : 'transparent' 
                  }, 
                  filtroEstado === estado ? { backgroundColor: '#00264D' } : { backgroundColor: '#F2F6FA' }
                ]}
                onPress={() => setFiltroEstado(estado)}
              >
                <Text style={[
                  styles.filterText, 
                  { fontSize: 13, marginTop: -2 }, // Ajuste fino para la fuente en Android
                  filtroEstado === estado ? { color: '#FFFFFF' } : { color: '#667788' }
                ]}>
                  {estado}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* --- TABLA DE RESULTADOS RESTRUCTURADA --- */}
        <View style={[styles.actionBlock, { padding: 0, overflow: 'hidden' }]}>
          
          {/* CABECERA DE LA TABLA */}
          <View style={styles.tableHeader}>
            <Text style={[styles.tableHeaderText, { flex: 1.1, paddingRight: 5 }]}>Fecha</Text>
            <Text style={[styles.tableHeaderText, { flex: 1.5, paddingRight: 5 }]}>Incidente</Text>
            <Text style={[styles.tableHeaderText, { flex: 1, paddingRight: 5 }]}>Lugar</Text>
            <Text style={[styles.tableHeaderText, { flex: 1, textAlign: 'right' }]}>Estado</Text>
          </View>

          {/* FILAS DE LA TABLA */}
          {casosFiltrados.length === 0 ? (
            <View style={{ alignItems: 'center', padding: 30 }}>
              <Ionicons name="folder-open-outline" size={40} color="#CCC" />
              <Text style={{ textAlign: 'center', marginTop: 10, color: '#666', fontSize: 14 }}>
                No se encontraron registros.
              </Text>
            </View>
          ) : (
            casosFiltrados.map((item, index) => (
              <View key={item.id} style={[styles.tableRow, index % 2 === 0 ? { backgroundColor: '#FFFFFF' } : { backgroundColor: '#F8F9FB' }]}>
                
                <Text style={[styles.tableCell, { flex: 1.1, fontSize: 12, paddingRight: 5 }]} numberOfLines={1}>
                  {item.fecha}
                </Text>
                
                <Text style={[styles.tableCell, { flex: 1.5, fontWeight: 'bold', color: '#00264D', paddingRight: 5 }]} numberOfLines={1}>
                  {item.caso}
                </Text>
                
                <Text style={[styles.tableCell, { flex: 1, paddingRight: 5 }]} numberOfLines={1}>
                  {item.ubicacion}
                </Text>
                
                <Text style={[styles.tableCell, { 
                  flex: 1, 
                  textAlign: 'right', 
                  fontWeight: 'bold',
                  fontSize: 11,
                  color: item.estado === 'Resuelto' || item.estado === 'Terminado' ? '#34C759' : item.estado === 'Multa' ? '#FF3B30' : '#FF9500' 
                }]} numberOfLines={1}>
                  {item.estado.toUpperCase()}
                </Text>
                
              </View>
            ))
          )}

        </View>

      </ScrollView>
    </View>
  );
}

// --- 10. ESTILOS COMPLETOS ---
const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: '#F3F6F9', 
  },
  deepHeader: {
    backgroundColor: '#00264D', 
    paddingTop: Platform.OS === 'ios' ? 70 : 60,
    paddingBottom: 30, 
    paddingHorizontal: 25,
  },
  headerCurve: {
    height: 30,
    backgroundColor: '#00264D',
    borderBottomLeftRadius: 40,
    borderBottomRightRadius: 40,
    marginBottom: 10,
  },
  headerGreeting: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#FFFFFF',
    letterSpacing: -0.5,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#B3CDE0', 
    marginTop: 5,
  },
  bodyContent: {
    paddingHorizontal: 20,
    paddingBottom: 60, 
  },
  actionBlock: {
    backgroundColor: '#FFFFFF', 
    borderRadius: 20,
    shadowColor: '#003366',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 20,
    paddingHorizontal: 20,
  },
  profileOptionIconContainer: {
    backgroundColor: '#E6F0FA', 
    width: 50,
    height: 50,
    borderRadius: 25, 
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 15,
  },
  actionTextGroup: {
    flex: 1, 
  },
  profileOptionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#00264D',
  },
  actionDesc: {
    fontSize: 13,
    color: '#667788',
    marginTop: 2,
  },
  separator: {
    height: 1,
    backgroundColor: '#F0F4F8',
    marginHorizontal: 20,
  },
  profileHeaderName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginTop: 15,
  },
  profileHeaderRoleTag: {
    color: '#34C759',
    fontWeight: 'bold',
    marginVertical: 8,
    fontSize: 12,
    backgroundColor: '#E5F9E7',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 20,
  },
  authContainer: {
    flexGrow: 1,
    backgroundColor: '#F3F6F9',
    paddingHorizontal: 25,
    paddingTop: Platform.OS === 'ios' ? 80 : 60, 
    justifyContent: 'center',
  },
  logoContainer: {
    backgroundColor: '#00264D',
    width: 100,
    height: 100,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  authTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#00264D',
  },
  authSubtitle: {
    fontSize: 16,
    color: '#667788',
    marginTop: 5,
  },
  authFormBlock: {
    backgroundColor: '#FFFFFF',
    borderRadius: 25,
    padding: 25,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
  },
  authLabel: {
    fontWeight: 'bold',
    color: '#00264D',
    marginBottom: 15,
    textAlign: 'center',
  },
  rolSelector: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 25,
  },
  btnRol: {
    flex: 1,
    paddingVertical: 12,
    marginHorizontal: 3,
    borderRadius: 12,
    backgroundColor: '#F2F6FA',
    alignItems: 'center',
  },
  btnRolActivo: {
    backgroundColor: '#00264D',
  },
  txtRol: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#667788',
  },
  txtRolActivo: {
    color: '#FFFFFF',
  },
  input: {
    backgroundColor: '#F8F9FB',
    borderWidth: 1,
    borderColor: '#E1E8EE',
    borderRadius: 12,
    padding: 15,
    fontSize: 15,
    marginBottom: 15,
  },
  btnGuardar: {
    backgroundColor: '#003366',
    paddingVertical: 16,
    borderRadius: 15,
    alignItems: 'center',
    marginTop: 10,
  },
  btnTexto: { color: '#FFF', fontSize: 16, fontWeight: 'bold' },
  filterBtn: {
    backgroundColor: '#E6F0FA',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    marginRight: 10,
    height: 40,
    justifyContent: 'center',
  },
  filterBtnActive: {
    backgroundColor: '#00264D',
  },
  filterText: {
    color: '#00264D',
    fontWeight: 'bold',
    fontSize: 13,
  },
  filterTextActive: {
    color: '#FFFFFF',
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#00264D',
    paddingVertical: 12,
    paddingHorizontal: 15,
  },
  tableHeaderText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 12,
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: 15,
    paddingHorizontal: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F4F8',
    alignItems: 'center',
  },
  tableCell: {
    fontSize: 12,
    color: '#667788',
  },
});