import React, { useState, createContext, useContext } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Modal, TextInput, Alert, Platform, Dimensions, StyleSheet} from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import { Ionicons } from '@expo/vector-icons';
import { PieChart, BarChart } from 'react-native-chart-kit'; 

// --- 1. PANTALLAS DE INICIO POR ROL ---

function InicioResidente({ usuario }) {
  const [modalVisible, setModalVisible] = useState(false);
  const [tipoLugar, setTipoLugar] = useState('apartamento'); 
  const [reporte, setReporte] = useState({ titulo: '', descripcion: '', categoria: 'Seguridad', torre_incidente: '', apartamento_incidente: '', area_comun: '' });
  const [modalEstadoVisible, setModalEstadoVisible] = useState(false);
  const [misReportes, setMisReportes] = useState([]);

  const enviarReporte = async () => {
    // 1. Validar primero que los campos obligatorios existan
    if (!reporte.titulo || !reporte.descripcion) {
      return Alert.alert('Atención', 'Llena título y descripción.');
    }

    // 2. Intentar el envío real al servidor de Laravel
    try {
      const IP_COMPUTADORA = '192.168.1.44'; 
      
      const respuesta = await fetch(`http://${IP_COMPUTADORA}:8000/api/reportar`, {
        method: 'POST',
        headers: { 
          'Accept': 'application/json', 
          'Content-Type': 'application/json' 
        },
        body: JSON.stringify({
          ...reporte,
          // Limpiamos los datos cruzados (si eligió apto, borramos area común y viceversa)
          area_comun: tipoLugar === 'area_comun' ? reporte.area_comun : null,
          torre_incidente: tipoLugar === 'apartamento' ? reporte.torre_incidente : null,
          apartamento_incidente: tipoLugar === 'apartamento' ? reporte.apartamento_incidente : null,
          
          user_id: usuario?.id, // Con esto Laravel ya sabe quién eres (Uso de ? para evitar crash si es indefinido)
          fecha: new Date().toISOString().slice(0, 19).replace('T', ' ')
        })
      });

      const resultado = await respuesta.json();

      if (respuesta.ok) {
        Alert.alert('Enviado', 'Tu reporte ha sido recibido por administración.');
        setModalVisible(false);
        // Reseteamos el formulario
        setReporte({ titulo: '', descripcion: '', categoria: 'Seguridad', torre_incidente: '', apartamento_incidente: '', area_comun: '' });
      } else {
        Alert.alert('Error', resultado.message || 'No se pudo enviar el reporte.');
      }
    } catch (error) {
      Alert.alert('Error', 'No se pudo conectar al servidor.');
    }
  };

  const cargarMisReportes = async () => {
    setMisReportes([
      { 
        id: 1, 
        titulo: 'Ruido excesivo', 
        categoria: 'Seguridad', 
        estado: 'En Proceso', 
        fecha: '2026-05-10 22:30', 
        descripcion: 'Música muy alta. No dejan dormir.', 
        historial: [{ id: 101, fecha: '2026-05-10 22:45', mensaje: 'Reporte recibido. Asignando guardia.' }] 
      }
    ]);
    setModalEstadoVisible(true);
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
          
          {/* BOTÓN NUEVO REPORTE */}
          <TouchableOpacity style={styles.actionRow} activeOpacity={0.7} onPress={() => setModalVisible(true)}>
            <View style={styles.profileOptionIconContainer}><Ionicons name="add-circle" size={24} color="#00264D" /></View>
            <View style={styles.actionTextGroup}>
              <Text style={styles.profileOptionTitle}>Nuevo Reporte</Text>
              <Text style={styles.actionDesc}>Crear una nueva alerta</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#CCC" />
          </TouchableOpacity>

          <View style={styles.separator} />

          {/* BOTÓN MIS REPORTES */}
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

      {/* --- MODAL: CREAR NUEVO REPORTE --- */}
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

      {/* --- MODAL DE SEGUIMIENTO (MIS REPORTES) --- */}
      <Modal animationType="slide" transparent={true} visible={modalEstadoVisible}>
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', paddingTop: 50 }}>
          <View style={{ flex: 1, backgroundColor: '#FFF', borderTopLeftRadius: 25, borderTopRightRadius: 25, padding: 20 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 15, alignItems: 'center' }}>
              <Text style={{ fontSize: 20, fontWeight: 'bold', color: '#003366' }}>Seguimiento de Casos</Text>
              <TouchableOpacity onPress={() => setModalEstadoVisible(false)}><Ionicons name="close-circle" size={28} color="#666" /></TouchableOpacity>
            </View>
            <ScrollView showsVerticalScrollIndicator={false}>
              {misReportes.map((caso) => (
                <View key={caso.id} style={{ backgroundColor: '#F8F9FA', padding: 18, borderRadius: 15, marginBottom: 18, borderWidth: 1, borderColor: '#E1E8EE' }}>
                  <Text style={{ fontWeight: 'bold', fontSize: 16, color: '#00264D' }}>{caso.categoria} - {caso.titulo}</Text>
                  <Text style={{ fontSize: 12, color: '#34C759', fontWeight: 'bold', marginVertical: 5 }}>ESTADO: {caso.estado?.toUpperCase() || 'PENDIENTE'}</Text>
                  <View style={{ backgroundColor: '#FFF', borderRadius: 10, padding: 10, borderWidth: 1, borderColor: '#E1E8EE', marginTop: 10 }}>
                    <Text style={{ fontSize: 12, color: '#667788', fontWeight: 'bold', borderLeftWidth: 3, borderLeftColor: '#003366', paddingLeft: 8 }}>Reporte recibido por administración.</Text>
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

// --- 3. PANTALLA INICIO VIGILANTE ---
function InicioVigilante({ usuario }) {
  const [modalVisible, setModalVisible] = useState(false);
  const [casos, setCasos] = useState([]);
  const [modalMisCasosVisible, setModalMisCasosVisible] = useState(false);
  const [misCasos, setMisCasos] = useState([]);

  const IP_COMPUTADORA = '192.168.1.44';

  // Función para pedir los casos NUEVOS a Laravel
  const cargarCasosActivos = async () => {
    try {
      const respuesta = await fetch(`http://${IP_COMPUTADORA}:8000/api/reportes/activos`);
      if (!respuesta.ok) throw new Error('Error de servidor');

      const datos = await respuesta.json();
      setCasos(datos);
      setModalVisible(true);
    } catch (error) {
      Alert.alert('Error de conexión', 'No se pudieron cargar los casos activos.');
    }
  };

  // Función para pedir los casos ASIGNADOS al vigilante
  const cargarMisCasos = async () => {
    try {
      const respuesta = await fetch(`http://${IP_COMPUTADORA}:8000/api/reportes/vigilante/${usuario?.id}`);
      if (!respuesta.ok) throw new Error('Error de servidor');

      const datos = await respuesta.json();
      setMisCasos(datos);
      setModalMisCasosVisible(true);
    } catch (error) {
      Alert.alert('Error de conexión', 'No se pudieron cargar tus casos en proceso.');
    }
  };

  // Función para que el vigilante tome un caso abierto
  const tomarCaso = async (idReporte) => {
    if (!usuario?.id) return Alert.alert('Error', 'No se pudo identificar las credenciales del vigilante.');
    try {
      const respuesta = await fetch(`http://${IP_COMPUTADORA}:8000/api/reportes/${idReporte}/tomar`, {
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

  // Formateador de fechas para los datos provenientes de Laravel
  const formatearFecha = (fechaCruda) => {
    if (!fechaCruda) return '';
    let fechaCorregida = fechaCruda;
    if (!fechaCruda.includes('T')) {
      fechaCorregida = fechaCruda.replace(' ', 'T') + 'Z';
    }
    const fecha = new Date(fechaCorregida);
    return fecha.toLocaleString('es-CO', {
      timeZone: 'America/Bogota',
      year: 'numeric', month: '2-digit', day: '2-digit',
      hour: '2-digit', minute: '2-digit', hour12: true 
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
            <View style={styles.profileOptionIconContainer}><Ionicons name="warning" size={24} color="#FF9500" /></View>
            <View style={styles.actionTextGroup}>
              <Text style={styles.profileOptionTitle}>Casos Activos</Text>
              <Text style={styles.actionDesc}>Alertas sin asignar</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#CCC" />
          </TouchableOpacity>

          <View style={styles.separator} />

          <TouchableOpacity style={styles.actionRow} activeOpacity={0.7} onPress={cargarMisCasos}>
            <View style={styles.profileOptionIconContainer}><Ionicons name="shield-checkmark" size={24} color="#34C759" /></View>
            <View style={styles.actionTextGroup}>
              <Text style={styles.profileOptionTitle}>Mis Casos</Text>
              <Text style={styles.actionDesc}>Novedades en proceso</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#CCC" />
          </TouchableOpacity>

        </View>
      </ScrollView>

      {/* MODAL: CASOS ACTIVOS */}
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

      {/* MODAL: MIS CASOS (EN PROCESO) */}
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
                  
                  <TouchableOpacity style={[styles.btnGuardar, {backgroundColor: '#003366', paddingVertical: 12, marginTop: 0}]} onPress={() => Alert.alert('Simulación', 'Caso cerrado exitosamente.')}>
                    <Text style={styles.btnTexto}>Finalizar Novedad</Text>
                  </TouchableOpacity>
                </View>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}

// --- 4. PANTALLA INICIO ADMINISTRADOR ---
function InicioAdmin({ usuario }) {
  const [modalVisible, setModalVisible] = useState(false);
  const [casos, setCasos] = useState([]);
  const [modalDirectorio, setModalDirectorio] = useState(false);
  const [residentes, setResidentes] = useState([]);

  const IP_COMPUTADORA = '192.168.1.44';

  // Cargar Todos los Casos desde Laravel
  const cargarTodosLosCasos = async () => {
    try {
      const respuesta = await fetch(`http://${IP_COMPUTADORA}:8000/api/reportes/todos`);
      if (!respuesta.ok) throw new Error('Error al obtener los casos');

      const datos = await respuesta.json();
      setCasos(datos);
      setModalVisible(true);
    } catch (error) {
      Alert.alert('Error', 'No se pudieron cargar los casos globales del servidor.');
    }
  };

  // Cargar Directorio de Residentes desde Laravel
  const cargarDirectorio = async () => {
    try {
      const respuesta = await fetch(`http://${IP_COMPUTADORA}:8000/api/directorio`);
      if (!respuesta.ok) throw new Error('Error al obtener el directorio');

      const datos = await respuesta.json();
      setResidentes(datos);
      setModalDirectorio(true);
    } catch (error) {
      Alert.alert('Error', 'No se pudo conectar al directorio de residentes.');
    }
  };

  // Formateador de fechas para unificar la visualización en el panel administrador
  const formatearFecha = (fechaCruda) => {
    if (!fechaCruda) return '';
    let fechaCorregida = fechaCruda;
    if (!fechaCruda.includes('T')) {
      fechaCorregida = fechaCruda.replace(' ', 'T') + 'Z';
    }
    const fecha = new Date(fechaCorregida);
    return fecha.toLocaleString('es-CO', {
      timeZone: 'America/Bogota',
      year: 'numeric', month: '2-digit', day: '2-digit',
      hour: '2-digit', minute: '2-digit', hour12: true 
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
          
          <TouchableOpacity style={styles.actionRow} activeOpacity={0.7} onPress={cargarTodosLosCasos}>
            <View style={styles.profileOptionIconContainer}><Ionicons name="folder-open" size={24} color="#00264D" /></View>
            <View style={styles.actionTextGroup}>
              <Text style={styles.profileOptionTitle}>Ver Todos los Casos</Text>
              <Text style={styles.actionDesc}>Historial y estados</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#CCC" />
          </TouchableOpacity>

          <View style={styles.separator} />

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

      {/* MODAL: TODOS LOS CASOS */}
      <Modal animationType="slide" transparent={true} visible={modalVisible}>
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', paddingTop: 50 }}>
          <View style={{ flex: 1, backgroundColor: '#FFF', borderTopLeftRadius: 25, borderTopRightRadius: 25, padding: 20 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 15, alignItems: 'center' }}>
              <Text style={{ fontSize: 20, fontWeight: 'bold', color: '#003366' }}>Historial Global</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}><Ionicons name="close-circle" size={28} color="#666" /></TouchableOpacity>
            </View>
            <ScrollView showsVerticalScrollIndicator={false}>
              {casos.length === 0 ? <Text style={{textAlign: 'center', marginTop: 20, color: '#666'}}>No se registran casos en el sistema 📁</Text> : null}
              {casos.map((caso) => (
                <View key={caso.id} style={{ backgroundColor: '#F8F9FA', padding: 18, borderRadius: 15, marginBottom: 18, borderWidth: 1, borderColor: '#E1E8EE', borderLeftWidth: 5, borderLeftColor: caso.estado === 'Terminado' || caso.estado === 'Resuelto' ? '#34C759' : '#FF9500' }}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Text style={{ fontWeight: 'bold', fontSize: 16, color: '#00264D' }}>{caso.titulo}</Text>
                    <Text style={{ fontWeight: 'bold', fontSize: 12, color: caso.estado === 'Terminado' || caso.estado === 'Resuelto' ? '#34C759' : '#FF9500' }}>{caso.estado?.toUpperCase() || 'PENDIENTE'}</Text>
                  </View>
                  <Text style={{ fontSize: 12, color: '#666', marginTop: 5 }}>📍 {caso.area_comun ? caso.area_comun : `T${caso.torre_incidente} - Apto ${caso.apartamento_incidente}`}</Text>
                  {caso.fecha && <Text style={{ fontSize: 11, color: '#888', fontStyle: 'italic' }}>🕒 Registro: {formatearFecha(caso.fecha)}</Text>}
                  <Text style={{ fontSize: 14, color: '#333', marginTop: 10 }}>{caso.descripcion}</Text>
                </View>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* MODAL: DIRECTORIO */}
      <Modal animationType="slide" transparent={true} visible={modalDirectorio}>
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', paddingTop: 50 }}>
          <View style={{ flex: 1, backgroundColor: '#FFF', borderTopLeftRadius: 25, borderTopRightRadius: 25, padding: 20 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 15, alignItems: 'center' }}>
              <Text style={{ fontSize: 20, fontWeight: 'bold', color: '#003366' }}>Residentes</Text>
              <TouchableOpacity onPress={() => setModalDirectorio(false)}><Ionicons name="close-circle" size={28} color="#666" /></TouchableOpacity>
            </View>
            <ScrollView showsVerticalScrollIndicator={false}>
              {residentes.length === 0 ? <Text style={{textAlign: 'center', marginTop: 20, color: '#666'}}>Directorio vacío</Text> : null}
              {residentes.map((res) => (
                <View key={res.id} style={{ backgroundColor: '#F8F9FA', padding: 18, borderRadius: 15, marginBottom: 15, borderWidth: 1, borderColor: '#E1E8EE' }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 10 }}>
                    <Ionicons name="person-circle" size={40} color="#00264D" />
                    <View style={{ marginLeft: 10 }}>
                      <Text style={{ fontWeight: 'bold', fontSize: 16, color: '#00264D' }}>{res.nombre} {res.apellidos}</Text>
                      <Text style={{ fontSize: 13, color: '#666' }}>Torre {res.torre} - Apto {res.apartamento}</Text>
                    </View>
                  </View>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', backgroundColor: '#FFF', padding: 10, borderRadius: 8, borderWidth: 1, borderColor: '#EEE' }}>
                    <View style={{ alignItems: 'center', flex: 1 }}>
                      <Text style={{ fontSize: 16, fontWeight: 'bold', color: '#34C759' }}>{res.casos_reportados}</Text>
                      <Text style={{ fontSize: 11, color: '#666', textAlign: 'center' }}>Reportados</Text>
                    </View>
                    <View style={{ width: 1, backgroundColor: '#EEE' }} />
                    <View style={{ alignItems: 'center', flex: 1 }}>
                      <Text style={{ fontSize: 16, fontWeight: 'bold', color: res.quejas_recibidas > 0 ? '#FF3B30' : '#666' }}>{res.quejas_recibidas}</Text>
                      <Text style={{ fontSize: 11, color: '#666', textAlign: 'center' }}>Quejas en contra</Text>
                    </View>
                  </View>
                  <Text style={{ fontSize: 12, color: '#888', marginTop: 10, textAlign: 'center' }}>📞 {res.celular}</Text>
                </View>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}

// --- 2. DIRECTOR DE TRÁFICO ---
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

// --- 2. PANTALLA PERFIL ---
function PantallaPerfil({ usuario, setUsuario }) {
  const rol = usuario.rol ? usuario.rol.toUpperCase() : 'RESIDENTE';
  const [modalQuejasVisible, setModalQuejasVisible] = useState(false);
  const [llamados, setLlamados] = useState([]); // Estado para llamados reales
  const [modalVisible, setModalVisible] = useState(false); // Modal de contraseña
  const [passwords, setPasswords] = useState({ actual: '', nueva: '', confirmar: '' });
  
  const IP_COMPUTADORA = '192.168.1.44';

  // Obtener los llamados de atención reales de este residente
  const cargarLlamadosAtencion = async () => {
    try {
      const respuesta = await fetch(`http://${IP_COMPUTADORA}:8000/api/usuarios/${usuario.id}/llamados`);
      if (!respuesta.ok) throw new Error('Error al obtener llamados');
      
      const datos = await respuesta.json();
      setLlamados(datos);
      setModalQuejasVisible(true);
    } catch (error) {
      Alert.alert('Error', 'No se pudieron cargar tus llamados de atención.');
    }
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
      const respuesta = await fetch(`http://${IP_COMPUTADORA}:8000/api/usuarios/${usuario.id}/cambiar-password`, {
        method: 'POST',
        headers: { 
          'Accept': 'application/json', 
          'Content-Type': 'application/json' 
        },
        body: JSON.stringify({
          password_actual: passwords.actual,
          password_nueva: passwords.nueva,
          password_nueva_confirmation: passwords.confirmar // Convención típica de Laravel
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
              <TouchableOpacity style={styles.actionRow} activeOpacity={0.7} onPress={cargarLlamadosAtencion}>
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

      {/* --- MODAL: LLAMADOS DE ATENCIÓN (CON DATOS DE LARAVEL) --- */}
      <Modal animationType="slide" transparent={true} visible={modalQuejasVisible}>
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', paddingTop: 100 }}>
          <View style={{ flex: 1, backgroundColor: '#FFF', borderTopLeftRadius: 25, borderTopRightRadius: 25, padding: 25 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20, alignItems: 'center' }}>
              <Text style={{ fontSize: 20, fontWeight: 'bold', color: '#003366' }}>Llamados de Atención</Text>
              <TouchableOpacity onPress={() => setModalQuejasVisible(false)}><Ionicons name="close-circle" size={28} color="#666" /></TouchableOpacity>
            </View>
            
            <ScrollView showsVerticalScrollIndicator={false}>
              {llamados.length === 0 ? <Text style={{textAlign: 'center', marginTop: 20, color: '#666'}}>No tienes llamados de atención registrados. ¡Buen comportamiento! 🎉</Text> : null}
              {llamados.map((queja) => (
                <View key={queja.id} style={{ backgroundColor: '#F2F6FA', padding: 18, borderRadius: 15, marginBottom: 15, borderLeftWidth: 5, borderLeftColor: '#003366' }}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 5 }}>
                    <Text style={{ fontWeight: 'bold', color: '#003366' }}>{queja.fecha}</Text>
                    <Text style={{ fontWeight: 'bold', color: '#FF3B30', fontSize: 12 }}>{queja.estado?.toUpperCase()}</Text>
                  </View>
                  <Text style={{ fontSize: 15, color: '#333' }}>{queja.motivo}</Text>
                </View>
              ))}
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

// --- 4. MURO DE AUTENTICACIÓN ---
function PantallaAuth({ setUsuario }) {
  const [esRegistro, setEsRegistro] = useState(false); 
  const [datos, setDatos] = useState({ nombre: '', apellidos: '', correo: '', celular: '', torre: '', apartamento: '', cedula: '', password: '', rol: 'residente' });

  const procesarFormulario = async () => {
    try {
      const IP_COMPUTADORA = '192.168.1.44'; 
      const endpoint = esRegistro ? '/api/registro' : '/api/login';
      const respuesta = await fetch(`http://${IP_COMPUTADORA}:8000${endpoint}`, {
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
      // AQUÍ ESTÁ LA SOLUCIÓN: Agregamos mucho más espacio abajo cuando es registro
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

// --- 5. CONFIGURACIÓN PRINCIPAL ---
const Tab = createMaterialTopTabNavigator();

export default function App() {
  const [usuario, setUsuario] = useState(null);

  if (!usuario) {
    return <PantallaAuth setUsuario={setUsuario} />;
  }

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
            backgroundColor: '#FFFFFF', elevation: 10, shadowColor: '#000', shadowOffset: { width: 0, height: -2 },
            shadowOpacity: 0.1, shadowRadius: 4, height: Platform.OS === 'ios' ? 105 : 95, paddingBottom: Platform.OS === 'ios' ? 40 : 35,
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

// --- 5. PANTALLA INFORMES SEMANALES (GRÁFICOS) ---
function PantallaInformes() {
  const [filtroActivo, setFiltroActivo] = useState('Categorias');
  const screenWidth = Dimensions.get('window').width - 80; // Ajuste para los márgenes

  // --- DATOS SIMULADOS PARA LOS GRÁFICOS ---
  const datosPastel = [
    { name: 'Seguridad', poblacion: 45, color: '#FF3B30', legendFontColor: '#333', legendFontSize: 12 },
    { name: 'Daños', poblacion: 30, color: '#FF9500', legendFontColor: '#333', legendFontSize: 12 },
    { name: 'Convivencia', poblacion: 25, color: '#34C759', legendFontColor: '#333', legendFontSize: 12 },
  ];

  const datosBarrasTorres = {
    labels: ['Torre 1', 'Torre 2', 'Torre 3', 'Torre 4'],
    datasets: [{ data: [12, 5, 8, 2] }]
  };

  const datosBarrasGuardias = {
    labels: ['Aemy', 'Carlos', 'Luis'],
    datasets: [{ data: [15, 9, 4] }]
  };

  const chartConfig = {
    backgroundColor: '#FFF',
    backgroundGradientFrom: '#FFF',
    backgroundGradientTo: '#FFF',
    color: (opacity = 1) => `rgba(0, 38, 77, ${opacity})`, // Azul premium
    labelColor: (opacity = 1) => `rgba(102, 119, 136, ${opacity})`,
    barPercentage: 0.6,
    decimalPlaces: 0,
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
        
        {/* FILTROS (Botones tipo pastilla) */}
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

        {/* CONTENEDOR DEL GRÁFICO */}
        <View style={styles.actionBlock}>
          <Text style={{ fontSize: 16, fontWeight: 'bold', color: '#00264D', marginBottom: 15, paddingHorizontal: 20, paddingTop: 20 }}>
            {filtroActivo === 'Categorias' && 'Distribución por Categoría (%)'}
            {filtroActivo === 'Torres' && 'Torres con más Infracciones/Daños'}
            {filtroActivo === 'Guardias' && 'Casos Resueltos por Guardia'}
          </Text>

          <View style={{ alignItems: 'center', paddingBottom: 20 }}>
            {filtroActivo === 'Categorias' ? (
              <PieChart
                data={datosPastel}
                width={screenWidth + 40}
                height={200}
                chartConfig={chartConfig}
                accessor={"poblacion"}
                backgroundColor={"transparent"}
                paddingLeft={"10"}
                absolute // Muestra el número en lugar del %
              />
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
            )}
          </View>
        </View>

        <View style={{ backgroundColor: '#E5F9E7', padding: 15, borderRadius: 15, marginTop: 20, borderWidth: 1, borderColor: '#C8E6C9' }}>
          <Text style={{ color: '#00264D', fontSize: 13 }}>💡 <Text style={{fontWeight: 'bold'}}>Análisis rápido:</Text> La Torre 1 presenta el mayor índice de reportes esta semana. Se sugiere aumentar las rondas de vigilancia en esa zona.</Text>
        </View>

      </ScrollView>
    </View>
  );
}

// --- 6. PANTALLA HISTÓRICO (TABLA ORGANIZADA) ---
function PantallaHistorico() {
  const casosConfirmados = [
    { id: '1024', fecha: '11/05/26', caso: 'Ruido excesivo', ubicacion: 'T1-101', estado: 'Resuelto' },
    { id: '1023', fecha: '09/05/26', caso: 'Fuga piscina', ubicacion: 'Área Común', estado: 'Resuelto' },
    { id: '1022', fecha: '05/05/26', caso: 'Mascota suelta', ubicacion: 'T2-305', estado: 'Multa' },
    { id: '1021', fecha: '02/05/26', caso: 'Lámpara rota', ubicacion: 'Parqueadero', estado: 'Resuelto' },
    { id: '1020', fecha: '28/04/26', caso: 'Basura pasillo', ubicacion: 'T1-204', estado: 'Aviso' },
  ];

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
        
        <View style={[styles.actionBlock, { padding: 0, overflow: 'hidden' }]}>
          
          {/* CABECERA DE LA TABLA */}
          <View style={styles.tableHeader}>
            <Text style={[styles.tableHeaderText, { flex: 0.8 }]}>Fecha</Text>
            <Text style={[styles.tableHeaderText, { flex: 1.5 }]}>Incidente</Text>
            <Text style={[styles.tableHeaderText, { flex: 1 }]}>Lugar</Text>
            <Text style={[styles.tableHeaderText, { flex: 1, textAlign: 'right' }]}>Cierre</Text>
          </View>

          {/* FILAS DE LA TABLA */}
          {casosConfirmados.map((item, index) => (
            <View key={item.id} style={[styles.tableRow, index % 2 === 0 ? { backgroundColor: '#FFFFFF' } : { backgroundColor: '#F8F9FB' }]}>
              <Text style={[styles.tableCell, { flex: 0.8, fontSize: 11 }]}>{item.fecha}</Text>
              <Text style={[styles.tableCell, { flex: 1.5, fontWeight: 'bold', color: '#00264D' }]} numberOfLines={1}>{item.caso}</Text>
              <Text style={[styles.tableCell, { flex: 1 }]}>{item.ubicacion}</Text>
              <Text style={[styles.tableCell, { 
                flex: 1, 
                textAlign: 'right', 
                fontWeight: 'bold',
                color: item.estado === 'Resuelto' ? '#34C759' : item.estado === 'Multa' ? '#FF3B30' : '#FF9500' 
              }]}>
                {item.estado}
              </Text>
            </View>
          ))}

        </View>

      </ScrollView>
    </View>
  );
}

// --- 6. ESTILOS COMPLETOS ---
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
    paddingBottom: 60, // Espacio al final
  },
  
  // ESTOS SON LOS ESTILOS QUE ARREGLAN EL PERFIL ROTO
  actionBlock: {
    backgroundColor: '#FFFFFF', // El fondo blanco que se había perdido
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
    flex: 1, // Esto obliga al texto a no esconderse
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

  // ESTILOS DE LOGIN
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
  // --- ESTILOS DE FILTROS (INFORMES) ---
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

  // --- ESTILOS DE LA TABLA (HISTÓRICO) ---
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