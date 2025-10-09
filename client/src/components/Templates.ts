import { Card, Button, Dialog, Portal, createOverlay } from "@chakra-ui/react";
import { epicToIcon } from "../methods";

interface DialogProps {
    title: string
    description?: string
    content?: React.ReactNode
  }

const dialog = createOverlay<DialogProps>((props) => {
    const { title, description, content, ...rest } = props
    return (
      <Dialog.Root {...rest}>
        <Portal>
          <Dialog.Backdrop />
          <Dialog.Positioner>
            <Dialog.Content>
              {title && (
                <Dialog.Header>
                  <Dialog.Title>{title}</Dialog.Title>
                </Dialog.Header>
              )}
              <Dialog.Body spaceY="4">
                {description && (
                  <Dialog.Description>{description}</Dialog.Description>
                )}
                {content}
              </Dialog.Body>
            </Dialog.Content>
          </Dialog.Positioner>
        </Portal>
      </Dialog.Root>
    )
  })

export const Templates = ({ templates }) => {
    return ![0, undefined].includes(templates?.length) && templates.map((template) => (<>
        <Card.Root maxW="sm">
            <Card.Header>
                <Card.Title>
                    {['МегаФон','РУДН','ФК_Краснодар','Flow'].includes(template.epic)
                        ? <img className="epicIcon size-6" src={`..\\img\\${epicToIcon[template.epic]}.png`} alt={template.epic} />
                        : epicToIcon[template.epic]
                    }
                    <h3 className="text-xl ml-3 text-[#e0e0e0]">{template.title}</h3>
                </Card.Title>
                <Card.Description>
                    {template.description
                        ? <div className="taskSubBlock mt-3" id="subBlock3"><h3 className="text-lg text-[#c0c0c0]">{template.description}</h3></div>
                        : <div className='m-0' />
                    }
                </Card.Description>
            </Card.Header>
            <Card.Body>
            </Card.Body>
            <Card.Footer justifyContent="flex-end">
            <Button
              onClick={() => {
                dialog.open("a", {
                  title: "Dialog Title",
                  description: "Dialog Description",
                })
              }}
            >Open Modal</Button>
            </Card.Footer>
        </Card.Root>
        <dialog.Viewport />
      </>)
    )
}