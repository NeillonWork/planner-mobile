import { ReactNode } from "react";
import { TextInput, TextInputProps, View, Platform, ViewProps } from "react-native";

// Utilitario CLSX para trabalhar com as variantes de forma condicional
import { clsx } from "clsx";
import { colors } from "@/styles/colors";

//Tipagem para o input
type InputProps =  ViewProps & {
  children: ReactNode;
  variant?: Variants;
};
// Tipagem para variações do input com 3 variações
type Variants = "primary" | "secondary" | "tertiary";

function Input({ children, variant = "primary", className, ...rest }: InputProps) {
  return (
    <View
      className={clsx(
        //Estilo comum
        "min-h-16 max-h-16 h-16 flex-row items-center gap-2",
        //Estilo das variantes
        {
          "h-14 px-4 rounded-lg border border-zinc-800": variant !== "primary",
          "bg-zinc-950": variant === "secondary",
          "bg-zinc-900": variant === "tertiary",
        },
        className
      )}
      {...rest}
    >
      {children}
    </View>
  );
}

//"...rest" para usar todas as propriedades do componente INPUT
function Field({ ...rest }: TextInputProps) {
  return (
    <TextInput
      className="flex-1 text-zinc-100 text-lg font-regular"
      placeholderTextColor={colors.zinc[400]}
      // cursorColor funciona somente no android
      cursorColor={colors.zinc[100]}
      // cursorColor compatibilizando para IOS
      selectionColor={Platform.OS === "ios" ? colors.zinc[100] : undefined}
      {...rest}
    />
  );
}

Input.Field = Field;

export { Input };
