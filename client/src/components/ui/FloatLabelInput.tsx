import type { InputProps } from "@chakra-ui/react"
import { Box, Field, Input, defineStyle, useControllableState } from "@chakra-ui/react"
import { useState } from "react"

interface FloatLabelInputProps extends InputProps {
  label: React.ReactNode
  value?: string | undefined
  defaultValue?: string | undefined
  onValueChange?: ((value: string) => void) | undefined,
  invalid?: boolean 
}

const floatingStyles = defineStyle({
  pos: "absolute",
  bg: "#131315",
  px: "0.5",
  top: "2.5",
  insetStart: "3",
  fontWeight: "normal",
  pointerEvents: "none",
  transition: "position",
  color: "fg.muted",
  "&[data-float]": {
    top: "-3",
    insetStart: "2",
    color: "fg",
  },
})

export const FloatLabelInput = (props: FloatLabelInputProps) => {
  const { label, onValueChange, value, defaultValue = "", invalid, ...rest } = props

  const [inputState, setInputState] = useControllableState({ defaultValue, onChange: onValueChange, value })

  const [focused, setFocused] = useState(false)
  const shouldFloat = inputState.length > 0 || focused

  return (
    <Field.Root w='9.5rem' invalid={invalid}>
        <Box pos="relative" w="full">
            <Input
                {...rest}
                onFocus={(e) => { props.onFocus?.(e); setFocused(true)}}
                onBlur={(e) => { props.onBlur?.(e); setFocused(false) }}
                onChange={(e) => { props.onChange?.(e); setInputState(e.target.value) }}
                value={inputState}
                data-float={shouldFloat || undefined}
                px={1}
                maxLength={10}
            />
            <Field.Label css={floatingStyles} data-float={shouldFloat || undefined}>
                {label}
            </Field.Label>
        </Box>
    </Field.Root>
  )
}