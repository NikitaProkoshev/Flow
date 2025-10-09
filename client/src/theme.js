import { createSystem, defaultConfig, defineConfig } from "@chakra-ui/react";
import { defineTokens } from "@chakra-ui/react"

const tokens = defineTokens({
  colors: {
    gray: {
      100: { value: "rgba(34,34,34,1)" }
    }
  },
})

const customConfig = defineConfig({
    disableLayers: true,
    theme: { tokens },
    cssVarsRoot: ":where(html)"
})


export const system = createSystem(defaultConfig, customConfig)