import { createSystem, defaultConfig } from "@chakra-ui/react";
import { defineTokens } from "@chakra-ui/react"

const tokens = defineTokens({
  colors: {
    gray: {
      100: { value: "rgba(34,34,34,1)" }
    }
  },
})

export const system = createSystem(defaultConfig, {
    disableLayers: true,
    theme: { tokens }
  })