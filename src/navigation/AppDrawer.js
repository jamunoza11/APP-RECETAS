// src/navigation/AppDrawer.js
import React, { useContext } from 'react';
import { createDrawerNavigator, DrawerContentScrollView, DrawerItemList, DrawerItem } from '@react-navigation/drawer';
import AppTabs from './AppTabs';
import FavoritesStack from './FavoritesStack'; // Importamos el Stack de favoritos
import SettingsScreen from '../screens/SettingsScreen';
import AboutScreen from '../screens/AboutScreen';
import { AuthContext } from '../context/AuthContext';

const Drawer = createDrawerNavigator();

function CustomDrawerContent(props) {
  const { logout } = useContext(AuthContext);

  return (
    <DrawerContentScrollView {...props}>
      <DrawerItemList {...props} />
      <DrawerItem 
        label="Cerrar Sesión" 
        onPress={() => logout()} 
        labelStyle={{ color: '#ff6347', fontWeight: 'bold' }}
      />
    </DrawerContentScrollView>
  );
}

export default function AppDrawer() {
  return (
    <Drawer.Navigator 
      drawerContent={(props) => <CustomDrawerContent {...props} />}
      screenOptions={{ headerShown: false }}
    >
      <Drawer.Screen name="HomeTabs" component={AppTabs} options={{ title: 'Inicio' }} />
      <Drawer.Screen name="FavoritesNav" component={FavoritesStack} options={{ title: 'Favoritos ❤️' }} />
      <Drawer.Screen name="Settings" component={SettingsScreen} options={{ title: 'Configuración' }} />
      <Drawer.Screen name="About" component={AboutScreen} options={{ title: 'Acerca de' }} />
    </Drawer.Navigator>
  );
}