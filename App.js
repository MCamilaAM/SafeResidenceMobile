import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform, TextInput, Alert, ScrollView, Modal } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import { Ionicons } from '@expo/vector-icons';

// --- 1. PANTALLAS DE INICIO POR ROL ---

function InicioResidente({ usuario }) {
  const [modalVisible, setModalVisible] = useState(false);
  
  // 1. AÑADIMOS LOS NUEVOS CAMPOS AL ESTADO INICIAL
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
      const IP_COMPUTADORA = '192.168.1.44'; 
      
      const respuesta = await fetch(`http://${IP_COMPUTADORA}:8000/api/reportar`, {
        method: 'POST',
        headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' },
        
        // 2. ACTUALIZAMOS EL "BODY" (EL SOBRE QUE ENVIAMOS)
        body: JSON.stringify({
          ...reporte, // <-- Esto incluye todo lo que el usuario escribió (título, descripción, y ahora torre_incidente, apartamento_incidente y area_comun)
          user_id: usuario.id, // Seguimos enviando quién es el que reporta
          // BORRAMOS: torre: usuario.torre y apartamento: usuario.apartamento
          fecha: new Date().toISOString().slice(0, 19).replace('T', ' ')
        })
      });

      const resultado = await respuesta.json();

      if (respuesta.ok) {
        Alert.alert('Enviado', 'Tu reporte ha sido recibido por administración.');
        setModalVisible(false);
        // Limpiamos el formulario al terminar
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

      {/* MODAL DE REPORTE */}
      <Modal animationType="slide" transparent={true} visible={modalVisible}>
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' }}>
          <ScrollView contentContainerStyle={{ backgroundColor: '#FFF', borderTopLeftRadius: 25, borderTopRightRadius: 25, padding: 25, paddingBottom: 50 }}>
            
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

            {/* 3. AÑADIMOS LAS CAJITAS DE TEXTO (TEXTINPUTS) PARA LA UBICACIÓN */}
            <Text style={{ fontSize: 14, fontWeight: 'bold', color: '#003366', marginBottom: 10 }}>¿Dónde ocurrió? (Opcional)</Text>
            
            <View style={{flexDirection: 'row', justifyContent: 'space-between'}}>
              <TextInput 
                style={[styles.input, {width: '48%'}]} 
                placeholder="Torre (Ej. 1)" 
                keyboardType="numeric" 
                value={reporte.torre_incidente} 
                onChangeText={(t) => setReporte({...reporte, torre_incidente: t})} 
              />
              <TextInput 
                style={[styles.input, {width: '48%'}]} 
                placeholder="Apto (Ej. 101)" 
                keyboardType="numeric" 
                value={reporte.apartamento_incidente} 
                onChangeText={(t) => setReporte({...reporte, apartamento_incidente: t})} 
              />
            </View>

            <TextInput 
              style={styles.input} 
              placeholder="O escribe un Área Común (Ej. Piscina, Lobby)" 
              value={reporte.area_comun} 
              onChangeText={(t) => setReporte({...reporte, area_comun: t})} 
            />

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
      </Modal>
    </View>
  );
}

function InicioVigilante({ usuario }) {
  return (
    <View style={styles.container}>
      <Text style={styles.headerTitle}>Vigilante {usuario.nombre} 👮 </Text>
      <View style={styles.row}>
        <TouchableOpacity style={styles.card} activeOpacity={0.7}>
          <View style={styles.iconContainer}><Ionicons name="warning" size={40} color="#003366" /></View>
          <Text style={styles.cardText}>Casos Activos</Text>
          <Text style={styles.cardSubText}>Tomar nuevo caso</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.card} activeOpacity={0.7}>
          <View style={styles.iconContainer}><Ionicons name="shield-checkmark" size={40} color="#003366" /></View>
          <Text style={styles.cardText}>Mis Casos</Text>
          <Text style={styles.cardSubText}>En proceso</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

function InicioAdmin({ usuario }) {
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.headerTitle}>Admin {usuario.nombre} 🏢</Text>
      <View style={styles.row}>
        <TouchableOpacity style={styles.card} activeOpacity={0.7}>
          <View style={styles.iconContainer}><Ionicons name="folder-open" size={40} color="#003366" /></View>
          <Text style={styles.cardText}>Todos los Casos</Text>
          <Text style={styles.cardSubText}>Gestión global</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.card} activeOpacity={0.7}>
          <View style={styles.iconContainer}><Ionicons name="sync-circle" size={40} color="#003366" /></View>
          <Text style={styles.cardText}>Actualizar Estados</Text>
          <Text style={styles.cardSubText}>Cambiar procesos</Text>
        </TouchableOpacity>
      </View>
      <View style={[styles.row, { marginTop: 20 }]}>
        <TouchableOpacity style={styles.card} activeOpacity={0.7}>
          <View style={styles.iconContainer}><Ionicons name="people" size={40} color="#003366" /></View>
          <Text style={styles.cardText}>Directorio</Text>
          <Text style={styles.cardSubText}>Info de residentes</Text>
        </TouchableOpacity>
        <View style={{ width: '48%' }} />
      </View>
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
  
  return (
    <ScrollView contentContainerStyle={styles.perfilContainer}>
      <View style={styles.perfilHeader}>
        <Ionicons name="person-circle" size={90} color="#003366" />
        <Text style={styles.perfilNombre}>{usuario.nombre} {usuario.apellidos}</Text>
        <Text style={{color: '#34C759', fontWeight: 'bold', marginVertical: 5}}>{rol}</Text>
        
        {/* Solo muestra Torre y Apto si es residente */}
        {rol === 'RESIDENTE' && (
          <Text style={styles.perfilSub}>Torre {usuario.torre} - Apto {usuario.apartamento}</Text>
        )}
        <Text style={styles.perfilSub}>{usuario.correo}</Text>
      </View>

      <View style={styles.row}>
        <TouchableOpacity style={styles.card} activeOpacity={0.7} onPress={() => Alert.alert('Próximamente', 'Aquí verás todos tus informes generados.')}>
          <View style={styles.iconContainer}><Ionicons name="document-text" size={36} color="#003366" /></View>
          <Text style={styles.cardText}>Mis Informes</Text>
          <Text style={styles.cardSubText}>Historial personal</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.card} activeOpacity={0.7} onPress={() => Alert.alert('Seguridad', 'Aquí podrás cambiar tu contraseña.')}>
          <View style={styles.iconContainer}><Ionicons name="lock-closed" size={36} color="#003366" /></View>
          <Text style={styles.cardText}>Contraseña</Text>
          <Text style={styles.cardSubText}>********</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.btnSalir} onPress={() => setUsuario(null)}>
        <Text style={styles.btnTexto}>Cerrar Sesión</Text>
      </TouchableOpacity>
    </ScrollView>
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