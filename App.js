import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform, TextInput, Alert, ScrollView, Modal } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import { Ionicons } from '@expo/vector-icons';

// --- 1. PANTALLAS DE INICIO POR ROL ---

function InicioResidente({ usuario }) {
  const [modalVisible, setModalVisible] = useState(false);
  
  // Variable para el menú: elige entre apartamento o área común
  const [tipoLugar, setTipoLugar] = useState('apartamento'); 

  const [reporte, setReporte] = useState({ 
    titulo: '', 
    descripcion: '', 
    categoria: 'Seguridad',
    torre_incidente: '',      
    apartamento_incidente: '',
    area_comun: ''            
  });

  const enviarReporte = async () => {
    if (!reporte.titulo || !reporte.descripcion) {
      Alert.alert('Atención', 'Por favor llena el título y la descripción.');
      return;
    }

    try {
      const IP_COMPUTADORA = '192.168.1.44'; //IP
      
      const respuesta = await fetch(`http://${IP_COMPUTADORA}:8000/api/reportar`, {
        method: 'POST',
        headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...reporte,
          // Limpiamos los datos cruzados (si eligió apto, borramos area común y viceversa)
          area_comun: tipoLugar === 'area_comun' ? reporte.area_comun : null,
          torre_incidente: tipoLugar === 'apartamento' ? reporte.torre_incidente : null,
          apartamento_incidente: tipoLugar === 'apartamento' ? reporte.apartamento_incidente : null,
          
          user_id: usuario.id, // Con esto Laravel ya sabe quién eres, tu torre y apto personal
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

  return (
    <View style={styles.container}>
      <Text style={styles.headerTitle}>Hola, {usuario.nombre} 👋</Text>
      <View style={styles.row}>
        <TouchableOpacity style={styles.card} activeOpacity={0.7} onPress={() => setModalVisible(true)}>
          <View style={styles.iconContainer}><Ionicons name="add-circle" size={40} color="#003366" /></View>
          <Text style={styles.cardText}>Nuevo Reporte</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.card} activeOpacity={0.7}>
          <View style={styles.iconContainer}><Ionicons name="search" size={40} color="#003366" /></View>
          <Text style={styles.cardText}>Consultar Estado</Text>
        </TouchableOpacity>
      </View>

      {/* MODAL DE REPORTE ARREGLADO */}
      <Modal animationType="slide" transparent={true} visible={modalVisible}>
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' }}>
          
          {/* Este View blanco ancla todo abajo y evita que se suba feo */}
          <View style={{ backgroundColor: '#FFF', borderTopLeftRadius: 25, borderTopRightRadius: 25, maxHeight: '90%' }}>
            <ScrollView contentContainerStyle={{ padding: 25, paddingBottom: 40 }}>
              
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 }}>
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

              {/* --- INICIO DEL NUEVO MENÚ DE UBICACIÓN --- */}
              <Text style={{ fontSize: 14, fontWeight: 'bold', color: '#003366', marginBottom: 10 }}>¿Dónde ocurrió el incidente? (Opcional)</Text>
              
              <View style={{ flexDirection: 'row', backgroundColor: '#F2F6FA', borderRadius: 10, padding: 4, marginBottom: 15 }}>
                <TouchableOpacity 
                  style={{ flex: 1, padding: 10, borderRadius: 8, backgroundColor: tipoLugar === 'apartamento' ? '#003366' : 'transparent', alignItems: 'center' }}
                  onPress={() => setTipoLugar('apartamento')}
                >
                  <Text style={{ fontWeight: 'bold', color: tipoLugar === 'apartamento' ? '#FFF' : '#666' }}>Apartamento</Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={{ flex: 1, padding: 10, borderRadius: 8, backgroundColor: tipoLugar === 'area_comun' ? '#003366' : 'transparent', alignItems: 'center' }}
                  onPress={() => setTipoLugar('area_comun')}
                >
                  <Text style={{ fontWeight: 'bold', color: tipoLugar === 'area_comun' ? '#FFF' : '#666' }}>Área Común</Text>
                </TouchableOpacity>
              </View>

              {/* CONDICIONAL: Muestra una cosa o la otra dependiendo de la pestaña seleccionada */}
              {tipoLugar === 'apartamento' ? (
                <View style={{flexDirection: 'row', justifyContent: 'space-between'}}>
                  <TextInput style={[styles.input, {width: '48%'}]} placeholder="Torre (Ej. 1)" keyboardType="numeric" value={reporte.torre_incidente} onChangeText={(t) => setReporte({...reporte, torre_incidente: t})} />
                  <TextInput style={[styles.input, {width: '48%'}]} placeholder="Apto (Ej. 101)" keyboardType="numeric" value={reporte.apartamento_incidente} onChangeText={(t) => setReporte({...reporte, apartamento_incidente: t})} />
                </View>
              ) : (
                <TextInput style={styles.input} placeholder="Ej. Piscina, Lobby, Parqueadero" value={reporte.area_comun} onChangeText={(t) => setReporte({...reporte, area_comun: t})} />
              )}
              {/* --- FIN DEL MENÚ --- */}

              <TextInput 
                style={[styles.input, { height: 100, textAlignVertical: 'top' }]} 
                placeholder="Describe los detalles del incidente..." 
                multiline={true} 
                value={reporte.descripcion} 
                onChangeText={(t) => setReporte({...reporte, descripcion: t})} 
              />

              <TouchableOpacity style={styles.btnGuardar} onPress={enviarReporte}>
                <Text style={styles.btnTexto}>Enviar Reporte</Text>
              </TouchableOpacity>

            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}

// --- VIGILANTE ---
// --- VIGILANTE ---
function InicioVigilante({ usuario }) {
  const [modalVisible, setModalVisible] = useState(false);
  const [casos, setCasos] = useState([]);

  // Función para pedir los casos a Laravel
  const cargarCasosActivos = async () => {
    try {
      const IP_COMPUTADORA = '192.168.1.44'; //IP
      const respuesta = await fetch(`http://${IP_COMPUTADORA}:8000/api/reportes/activos`);
      
      if (!respuesta.ok) {
        throw new Error('Error de servidor');
      }

      const datos = await respuesta.json();
      setCasos(datos);
      setModalVisible(true);
    } catch (error) {
      Alert.alert('Error de conexión', 'Verifica tu IP y que el servidor Laravel esté encendido.');
    }
  };

  // Función para que el vigilante tome el caso
  const tomarCaso = async (idReporte) => {
    try {
      const IP_COMPUTADORA = '192.168.1.44'; //IP
      const respuesta = await fetch(`http://${IP_COMPUTADORA}:8000/api/reportes/${idReporte}/tomar`, {
        method: 'POST',
        headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' },
        body: JSON.stringify({ vigilante_id: usuario.id })
      });

      if (respuesta.ok) {
        Alert.alert('Éxito', 'Has tomado este caso. Está en proceso.');
        setModalVisible(false); // Cerramos el modal
      }
    } catch (error) {
      Alert.alert('Error', 'No se pudo tomar el caso.');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.headerTitle}>Guardia {usuario.nombre} 👮</Text>
      <View style={styles.row}>
        
        {/* BOTÓN 1: CASOS ACTIVOS */}
        <TouchableOpacity style={styles.card} activeOpacity={0.7} onPress={cargarCasosActivos}>
          <View style={styles.iconContainer}><Ionicons name="warning" size={40} color="#FF9500" /></View>
          <Text style={styles.cardText}>Casos Activos</Text>
          <Text style={styles.cardSubText}>Tomar nuevo caso</Text>
        </TouchableOpacity>

        {/* BOTÓN 2: MIS CASOS (RESTAURADO) */}
        <TouchableOpacity style={styles.card} activeOpacity={0.7} onPress={() => Alert.alert('Próximamente', 'Aquí verás los casos que has tomado.')}>
          <View style={styles.iconContainer}><Ionicons name="shield-checkmark" size={40} color="#34C759" /></View>
          <Text style={styles.cardText}>Mis Casos</Text>
          <Text style={styles.cardSubText}>En proceso</Text>
        </TouchableOpacity>

      </View>

      {/* MODAL CASOS ACTIVOS (VIGILANTE) */}
      <Modal animationType="slide" transparent={true} visible={modalVisible}>
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', paddingTop: 50 }}>
          <View style={{ flex: 1, backgroundColor: '#FFF', borderTopLeftRadius: 25, borderTopRightRadius: 25, padding: 20 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 15 }}>
              <Text style={{ fontSize: 20, fontWeight: 'bold', color: '#003366' }}>Alertas Abiertas</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}><Ionicons name="close-circle" size={28} color="#666" /></TouchableOpacity>
            </View>

            <ScrollView>
              {casos.length === 0 ? <Text style={{textAlign: 'center', marginTop: 20}}>No hay casos activos ✅</Text> : null}
              {casos.map((caso) => (
                <View key={caso.id} style={{ backgroundColor: '#F2F6FA', padding: 15, borderRadius: 10, marginBottom: 15 }}>
                  <Text style={{ fontWeight: 'bold', fontSize: 16, color: '#FF9500' }}>{caso.categoria} - {caso.titulo}</Text>
                  <Text style={{ fontSize: 13, color: '#666', marginBottom: 5 }}>📍 Lugar: {caso.area_comun ? caso.area_comun : `Torre ${caso.torre_incidente} Apto ${caso.apartamento_incidente}`}</Text>
                  <Text style={{ fontSize: 13, color: '#666', marginBottom: 10 }}>Reportado por: {caso.residente?.nombre} (Torre {caso.residente?.torre} Apto {caso.residente?.apartamento})</Text>
                  <Text style={{ fontSize: 12, color: '#888', marginTop: 3, marginBottom: 5, fontStyle: 'italic' }}>🕒 Reportado: {caso.fecha}</Text>
                  <Text style={{ fontSize: 14, marginBottom: 15 }}>{caso.descripcion}</Text>
                  
                  <TouchableOpacity style={[styles.btnGuardar, {backgroundColor: '#34C759', padding: 10, marginTop: 0}]} onPress={() => tomarCaso(caso.id)}>
                    <Text style={styles.btnTexto}>Tomar Caso</Text>
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

// --- ADMINISTRADOR ---
function InicioAdmin({ usuario }) {
  // Estados para Modal de Casos
  const [modalVisible, setModalVisible] = useState(false);
  const [casos, setCasos] = useState([]);

  // Estados para Modal de Directorio (NUEVO)
  const [modalDirectorio, setModalDirectorio] = useState(false);
  const [residentes, setResidentes] = useState([]);

  // Cargar Todos los Casos
  const cargarTodosLosCasos = async () => {
    try {
      const IP_COMPUTADORA = '192.168.1.44'; //IP
      const respuesta = await fetch(`http://${IP_COMPUTADORA}:8000/api/reportes/todos`);
      if (!respuesta.ok) throw new Error('Error');
      const datos = await respuesta.json();
      setCasos(datos);
      setModalVisible(true);
    } catch (error) {
      Alert.alert('Error', 'No se pudieron cargar los casos.');
    }
  };

  // Cargar Directorio (NUEVO)
  const cargarDirectorio = async () => {
    try {
      const IP_COMPUTADORA = '192.168.1.44'; //IP
      const respuesta = await fetch(`http://${IP_COMPUTADORA}:8000/api/directorio`);
      if (!respuesta.ok) throw new Error('Error');
      const datos = await respuesta.json();
      setResidentes(datos);
      setModalDirectorio(true);
    } catch (error) {
      Alert.alert('Error', 'No se pudo cargar el directorio.');
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.headerTitle}>Admin {usuario.nombre} 🏢</Text>
      
      <View style={styles.row}>
        <TouchableOpacity style={styles.card} activeOpacity={0.7} onPress={cargarTodosLosCasos}>
          <View style={styles.iconContainer}><Ionicons name="folder-open" size={40} color="#003366" /></View>
          <Text style={styles.cardText}>Todos los Casos</Text>
          <Text style={styles.cardSubText}>Gestión global</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.card} activeOpacity={0.7} onPress={() => Alert.alert('Próximamente', 'Aquí podrás cerrar casos terminados.')}>
          <View style={styles.iconContainer}><Ionicons name="sync-circle" size={40} color="#003366" /></View>
          <Text style={styles.cardText}>Actualizar Estados</Text>
          <Text style={styles.cardSubText}>Cambiar procesos</Text>
        </TouchableOpacity>
      </View>
      
      <View style={[styles.row, { marginTop: 20 }]}>
        {/* BOTÓN DIRECTORIO CON SU NUEVA FUNCIÓN */}
        <TouchableOpacity style={styles.card} activeOpacity={0.7} onPress={cargarDirectorio}>
          <View style={styles.iconContainer}><Ionicons name="people" size={40} color="#003366" /></View>
          <Text style={styles.cardText}>Directorio</Text>
          <Text style={styles.cardSubText}>Info de residentes</Text>
        </TouchableOpacity>
        <View style={{ width: '48%' }} />
      </View>

      {/* MODAL TODOS LOS CASOS (El que ya teníamos) */}
      <Modal animationType="slide" transparent={true} visible={modalVisible}>
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', paddingTop: 50 }}>
          <View style={{ flex: 1, backgroundColor: '#FFF', borderTopLeftRadius: 25, borderTopRightRadius: 25, padding: 20 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 15 }}>
              <Text style={{ fontSize: 20, fontWeight: 'bold', color: '#003366' }}>Historial Global</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}><Ionicons name="close-circle" size={28} color="#666" /></TouchableOpacity>
            </View>

            <ScrollView>
              {casos.length === 0 ? <Text style={{textAlign: 'center', marginTop: 20}}>No hay reportes en el sistema.</Text> : null}
              {casos.map((caso) => (
                <View key={caso.id} style={{ backgroundColor: '#F2F6FA', padding: 15, borderRadius: 10, marginBottom: 15, borderLeftWidth: 5, borderLeftColor: caso.estado === 'Abierto' ? '#FF9500' : '#34C759' }}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                    <Text style={{ fontWeight: 'bold', fontSize: 16, color: '#003366' }}>{caso.titulo}</Text>
                    <Text style={{ fontWeight: 'bold', color: caso.estado === 'Abierto' ? '#FF9500' : '#34C759' }}>{caso.estado}</Text>
                  </View>
                  <Text style={{ fontSize: 12, color: '#888', marginTop: 5, fontStyle: 'italic' }}>🕒 Reportado: {caso.fecha}</Text>
                  <Text style={{ fontSize: 12, color: '#666', marginTop: 5 }}>📍 Incidente: {caso.area_comun ? caso.area_comun : `Torre ${caso.torre_incidente} Apto ${caso.apartamento_incidente}`}</Text>
                  <Text style={{ fontSize: 12, color: '#666' }}>👤 Autor: {caso.residente?.nombre} (T{caso.residente?.torre}-A{caso.residente?.apartamento})</Text>
                  <Text style={{ fontSize: 14, marginVertical: 8 }}>{caso.descripcion}</Text>
                  
                  {caso.vigilante && (
                    <Text style={{ fontSize: 12, fontWeight: 'bold', color: '#003366', backgroundColor: '#E6F0FA', padding: 5, borderRadius: 5 }}>
                      🛡️ Asignado a: Guardia {caso.vigilante.nombre}
                    </Text>
                  )}
                </View>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* --- NUEVO MODAL DIRECTORIO --- */}
      <Modal animationType="slide" transparent={true} visible={modalDirectorio}>
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', paddingTop: 50 }}>
          <View style={{ flex: 1, backgroundColor: '#FFF', borderTopLeftRadius: 25, borderTopRightRadius: 25, padding: 20 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 15 }}>
              <Text style={{ fontSize: 20, fontWeight: 'bold', color: '#003366' }}>Directorio de Residentes</Text>
              <TouchableOpacity onPress={() => setModalDirectorio(false)}><Ionicons name="close-circle" size={28} color="#666" /></TouchableOpacity>
            </View>

            <ScrollView>
              {residentes.length === 0 ? <Text style={{textAlign: 'center', marginTop: 20}}>No hay residentes registrados.</Text> : null}
              {residentes.map((res) => (
                <View key={res.id} style={{ backgroundColor: '#FFF', padding: 15, borderRadius: 10, marginBottom: 15, borderWidth: 1, borderColor: '#E0E0E0', shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 5, elevation: 2 }}>
                  
                  <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 10 }}>
                    <Ionicons name="person-circle" size={40} color="#003366" />
                    <View style={{ marginLeft: 10 }}>
                      <Text style={{ fontWeight: 'bold', fontSize: 16, color: '#003366' }}>{res.nombre} {res.apellidos}</Text>
                      <Text style={{ fontSize: 13, color: '#666' }}>Torre {res.torre} - Apto {res.apartamento}</Text>
                    </View>
                  </View>

                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', backgroundColor: '#F2F6FA', padding: 10, borderRadius: 8 }}>
                    <View style={{ alignItems: 'center', flex: 1 }}>
                      <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#34C759' }}>{res.casos_reportados}</Text>
                      <Text style={{ fontSize: 11, color: '#666', textAlign: 'center' }}>Casos{'\n'}Reportados</Text>
                    </View>
                    <View style={{ width: 1, backgroundColor: '#CCC' }} />
                    <View style={{ alignItems: 'center', flex: 1 }}>
                      {/* Si tiene quejas recibidas en curso, lo ponemos en rojo, si no en gris */}
                      <Text style={{ fontSize: 18, fontWeight: 'bold', color: res.quejas_recibidas > 0 ? '#FF3B30' : '#666' }}>
                        {res.quejas_recibidas}
                      </Text>
                      <Text style={{ fontSize: 11, color: '#666', textAlign: 'center' }}>Quejas en{'\n'}su contra</Text>
                    </View>
                  </View>
                  
                  <Text style={{ fontSize: 12, color: '#888', marginTop: 10 }}>📞 {res.celular} | ✉️ {res.correo}</Text>
                </View>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>

    </ScrollView>
  );
}

// --- 2. DIRECTOR DE TRÁFICO ---
function PantallaPrincipal({ usuario }) {
  const rolDelUsuario = usuario.rol ? usuario.rol.toLowerCase() : 'residente';

  if (rolDelUsuario === 'vigilante') {
    return <InicioVigilante usuario={usuario} />;
  } else if (rolDelUsuario === 'administrador') {
    return <InicioAdmin usuario={usuario} />;
  } else {
    return <InicioResidente usuario={usuario} />;
  }
}

// --- 3. OTRAS PANTALLAS ---
function PantallaInformes() { return <View style={styles.center}><Text>Informes Semanales</Text></View>; }
function PantallaHistorico() { return <View style={styles.center}><Text>Histórico de Incidentes</Text></View>; }

function PantallaPerfil({ usuario, setUsuario }) {
  const rol = usuario.rol ? usuario.rol.toUpperCase() : 'RESIDENTE';
  
  // Estados para el Modal de Contraseña
  const [modalVisible, setModalVisible] = useState(false);
  const [passwords, setPasswords] = useState({ actual: '', nueva: '', confirmar: '' });

  const cambiarContraseña = async () => {
    if (!passwords.actual || !passwords.nueva || !passwords.confirmar) {
      Alert.alert('Atención', 'Por favor llena todos los campos.');
      return;
    }
    if (passwords.nueva !== passwords.confirmar) {
      Alert.alert('Error', 'La nueva contraseña no coincide con la confirmación.');
      return;
    }

    try {
      const IP_COMPUTADORA = '192.168.1.44'; //IP
      
      const respuesta = await fetch(`http://${IP_COMPUTADORA}:8000/api/cambiar-password`, {
        method: 'POST',
        headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: usuario.id,
          password_actual: passwords.actual,
          password_nueva: passwords.nueva
        })
      });

      const resultado = await respuesta.json();

      if (respuesta.ok) {
        Alert.alert('Éxito', 'Tu contraseña ha sido actualizada por seguridad.');
        setModalVisible(false);
        setPasswords({ actual: '', nueva: '', confirmar: '' }); // Limpiamos las cajitas
      } else {
        Alert.alert('Error', resultado.message || 'No se pudo actualizar la contraseña.');
      }
    } catch (error) {
      Alert.alert('Error', 'No se pudo conectar al servidor.');
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.perfilContainer}>
      <View style={styles.perfilHeader}>
        <Ionicons name="person-circle" size={90} color="#003366" />
        <Text style={styles.perfilNombre}>{usuario.nombre} {usuario.apellidos}</Text>
        <Text style={{color: '#34C759', fontWeight: 'bold', marginVertical: 5}}>{rol}</Text>
        
        {rol === 'RESIDENTE' && (
          <Text style={styles.perfilSub}>Torre {usuario.torre} - Apto {usuario.apartamento}</Text>
        )}
        <Text style={styles.perfilSub}>{usuario.correo}</Text>
      </View>

      <View style={styles.row}>
        {/* CONDICIONAL: Qué mostrar según el rol */}
        {rol === 'RESIDENTE' ? (
          <TouchableOpacity style={styles.card} activeOpacity={0.7} onPress={() => Alert.alert('Próximamente', 'Aquí verás todos tus informes generados.')}>
            <View style={styles.iconContainer}><Ionicons name="document-text" size={36} color="#003366" /></View>
            <Text style={styles.cardText}>Mis Informes</Text>
            <Text style={styles.cardSubText}>Historial personal</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity style={styles.card} activeOpacity={0.7} onPress={() => Alert.alert('Ajustes', 'Configuración de notificaciones.')}>
            <View style={styles.iconContainer}><Ionicons name="notifications" size={36} color="#003366" /></View>
            <Text style={styles.cardText}>Notificaciones</Text>
            <Text style={styles.cardSubText}>Alertas push</Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity style={styles.card} activeOpacity={0.7} onPress={() => setModalVisible(true)}>
          <View style={styles.iconContainer}><Ionicons name="lock-closed" size={36} color="#003366" /></View>
          <Text style={styles.cardText}>Contraseña</Text>
          <Text style={styles.cardSubText}>Cambiar clave</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.btnSalir} onPress={() => setUsuario(null)}>
        <Text style={styles.btnTexto}>Cerrar Sesión</Text>
      </TouchableOpacity>

      {/* MODAL DE CAMBIAR CONTRASEÑA */}
      <Modal animationType="fade" transparent={true} visible={modalVisible}>
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: 20 }}>
          <View style={{ backgroundColor: '#FFF', borderRadius: 20, padding: 25 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 }}>
              <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#003366' }}>Seguridad de Cuenta</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}><Ionicons name="close-circle" size={28} color="#666" /></TouchableOpacity>
            </View>

            <Text style={{ fontSize: 13, color: '#666', marginBottom: 15 }}>Por seguridad, primero ingresa tu contraseña actual.</Text>

            <TextInput 
              style={styles.input} 
              placeholder="Contraseña Actual" 
              secureTextEntry={true} 
              value={passwords.actual} 
              onChangeText={(t) => setPasswords({...passwords, actual: t})} 
            />
            <TextInput 
              style={styles.input} 
              placeholder="Nueva Contraseña" 
              secureTextEntry={true} 
              value={passwords.nueva} 
              onChangeText={(t) => setPasswords({...passwords, nueva: t})} 
            />
            <TextInput 
              style={styles.input} 
              placeholder="Confirmar Nueva Contraseña" 
              secureTextEntry={true} 
              value={passwords.confirmar} 
              onChangeText={(t) => setPasswords({...passwords, confirmar: t})} 
            />

            <TouchableOpacity style={styles.btnGuardar} onPress={cambiarContraseña}>
              <Text style={styles.btnTexto}>Actualizar Contraseña</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

    </ScrollView>
  );
}

// --- 4. MURO DE AUTENTICACIÓN ---
function PantallaAuth({ setUsuario }) {
  const [esRegistro, setEsRegistro] = useState(false); 
  const [datos, setDatos] = useState({ nombre: '', apellidos: '', correo: '', celular: '', torre: '', apartamento: '', cedula: '', password: '', rol: 'residente' });

  const procesarFormulario = async () => {
    try {
      const IP_COMPUTADORA = '192.168.1.44'; //IP
      
      const endpoint = esRegistro ? '/api/registro' : '/api/login';

      const respuesta = await fetch(`http://${IP_COMPUTADORA}:8000${endpoint}`, {
        method: 'POST',
        headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' },
        body: JSON.stringify(datos)
      });

      const resultado = await respuesta.json();

      if (respuesta.ok) {
        setUsuario(resultado.usuario);
      } else {
        Alert.alert('Error', resultado.message || 'Verifica los datos ingresados.');
      }
    } catch (error) {
      Alert.alert('Error', 'No se pudo conectar al servidor.');
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.authContainer}>
      <Ionicons name="business" size={80} color="#003366" style={{ alignSelf: 'center', marginBottom: 20 }} />
      <Text style={[styles.headerTitle, {marginBottom: 10}]}>{esRegistro ? 'Crear Cuenta' : 'Iniciar Sesión'}</Text>

      {esRegistro && (
        <>
          <Text style={{fontWeight: 'bold', color: '#003366', marginBottom: 10}}>Selecciona tu función:</Text>
          <View style={{flexDirection: 'row', justifyContent: 'space-between', marginBottom: 15}}>
            {['residente', 'vigilante', 'administrador'].map((opcion) => (
              <TouchableOpacity 
                key={opcion}
                style={[styles.btnRol, datos.rol === opcion && styles.btnRolActivo]}
                onPress={() => setDatos({...datos, rol: opcion})}
              >
                <Text style={[styles.txtRol, datos.rol === opcion && styles.txtRolActivo]}>
                  {opcion.charAt(0).toUpperCase() + opcion.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <TextInput style={styles.input} placeholder="Nombre" value={datos.nombre} onChangeText={(t) => setDatos({...datos, nombre: t})} />
          <TextInput style={styles.input} placeholder="Apellidos" value={datos.apellidos} onChangeText={(t) => setDatos({...datos, apellidos: t})} />
          <TextInput style={styles.input} placeholder="Celular" keyboardType="phone-pad" value={datos.celular} onChangeText={(t) => setDatos({...datos, celular: t})} />
          
          {/* Mostrar Torre y Apto SOLO si es residente */}
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

      <TouchableOpacity style={{ marginTop: 25, marginBottom: 40, alignItems: 'center' }} onPress={() => setEsRegistro(!esRegistro)}>
        <Text style={{ color: '#003366', fontWeight: 'bold', fontSize: 16 }}>
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

// --- 6. ESTILOS COMPLETOS ---
const styles = StyleSheet.create({
  container: { flexGrow: 1, backgroundColor: '#F2F6FA', paddingTop: 70, paddingHorizontal: 20, alignItems: 'center' },
  headerTitle: { fontSize: 24, fontWeight: '800', color: '#002244', marginBottom: 30, letterSpacing: 0.5, textAlign: 'center' },
  row: { flexDirection: 'row', justifyContent: 'space-between', width: '100%' },
  card: { backgroundColor: '#FFFFFF', width: '48%', aspectRatio: 0.9, justifyContent: 'center', alignItems: 'center', borderRadius: 16, padding: 15, elevation: 4, shadowColor: '#003366', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 8 },
  iconContainer: { backgroundColor: '#E6F0FA', padding: 12, borderRadius: 50, marginBottom: 12 },
  cardText: { textAlign: 'center', color: '#002244', fontWeight: '700', fontSize: 15 },
  cardSubText: { textAlign: 'center', color: '#666', fontSize: 11, marginTop: 4 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F2F6FA' },
  
  // Estilos Auth
  authContainer: { padding: 20, paddingTop: 80, backgroundColor: '#F2F6FA', flexGrow: 1, justifyContent: 'center' },
  input: { backgroundColor: '#FFF', padding: 15, borderRadius: 10, marginBottom: 15, borderWidth: 1, borderColor: '#E6F0FA', fontSize: 16 },
  btnGuardar: { backgroundColor: '#003366', padding: 15, borderRadius: 10, alignItems: 'center', marginTop: 10 },
  btnTexto: { color: '#FFF', fontWeight: 'bold', fontSize: 16 },
  btnRol: { flex: 1, padding: 10, borderWidth: 1, borderColor: '#003366', borderRadius: 8, marginHorizontal: 2, alignItems: 'center' },
  btnRolActivo: { backgroundColor: '#003366' },
  txtRol: { fontSize: 12, color: '#003366', fontWeight: 'bold' },
  txtRolActivo: { color: '#FFF' },
  
  // Estilos Perfil Rediseñado
  perfilContainer: { padding: 20, paddingTop: 60, backgroundColor: '#F2F6FA', flexGrow: 1, alignItems: 'center' },
  perfilHeader: { alignItems: 'center', marginBottom: 30, backgroundColor: '#FFF', width: '100%', padding: 20, borderRadius: 16, elevation: 2, shadowColor: '#000', shadowOffset: {width: 0, height: 2}, shadowOpacity: 0.05 },
  perfilNombre: { fontSize: 22, fontWeight: 'bold', color: '#002244', marginTop: 10, textAlign: 'center' },
  perfilSub: { fontSize: 15, color: '#666', marginTop: 5 },
  btnSalir: { backgroundColor: '#FF3B30', padding: 15, borderRadius: 10, alignItems: 'center', marginTop: 30, width: '100%' },
});