// esta repassando minhas rotas do style
import "@/styles/global.css";
import { Slot } from "expo-router";
import { View, StatusBar } from "react-native";
import '@/utils/dayjsLocaleConfig'

import {
  useFonts,
  Inter_500Medium,
  Inter_400Regular,
  Inter_600SemiBold,
} from "@expo-google-fonts/inter";

import Loading from "@/components/loading";

export default function Layout() {
//carregando as fontes
 const [fontsLoaded] = useFonts({
    Inter_500Medium,
    Inter_400Regular,
    Inter_600SemiBold,
  });

  if(!fontsLoaded){
    //se estiver carregando as fontes o icon ira surgir animando a tela
    return <Loading/>
  }

  return (
    <View className="flex-1 bg-zinc-950">
      <StatusBar
        barStyle="light-content"
        backgroundColor="transparent"
        translucent
      />
      <Slot />
    </View>
  );
}
