import {
  ButtonProps,
  FormControl,
  FormLabel,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Spinner,
  Stack,
  Text,
  Textarea,
  useColorModeValue,
  useDisclosure,
} from "@chakra-ui/react"
import { useIsTabsStuck } from "components/[guild]/Tabs"
import { useThemeContext } from "components/[guild]/ThemeContext"
import Button from "components/common/Button"
import FormErrorMessage from "components/common/FormErrorMessage"
import Link from "components/common/Link"
import { Modal } from "components/common/Modal"
import { Chat, PaperPlaneRight } from "phosphor-react"
import { FormProvider, useForm, useWatch } from "react-hook-form"
import useReachableUsers from "../hooks/useReachableUsers"
import useSendMessage from "../hooks/useSendMessage"
import useTargetedCount from "../hooks/useTargetedCount"
import RoleIdsSelect from "./components/RoleIdsSelect"

export type MessageProtocol = "XMTP" | "WEB3INBOX"
export type MessageDestination = "GUILD" | "ADMINS" | "ROLES"
type SendMessageForm = {
  protocol: MessageProtocol
  destination: MessageDestination
  roleIds: number[]
  message: string
}

const SendNewMessage = (props: ButtonProps) => {
  const methods = useForm<SendMessageForm>({
    mode: "all",
    defaultValues: {
      protocol: "WEB3INBOX",
      destination: "ROLES",
      roleIds: [],
      message: "",
    },
  })
  const {
    control,
    register,
    formState: { errors },
    reset,
    handleSubmit,
  } = methods

  const { isOpen, onOpen, onClose } = useDisclosure()
  const { isStuck } = useIsTabsStuck()
  const { textColor, buttonColorScheme } = useThemeContext()

  const { onSubmit, isLoading } = useSendMessage(() => {
    reset()
    onClose()
  })

  const roleIds = useWatch({ control, name: "roleIds" })
  const { targetedCount, isTargetedCountValidating } = useTargetedCount(roleIds)
  const { data: reachableUsers, isValidating: isReachableUsersLoading } =
    useReachableUsers("WEB3INBOX", "ROLES", roleIds)

  const greenTextColor = useColorModeValue("green.600", "green.300")

  return (
    <>
      <Button
        leftIcon={<Chat />}
        onClick={onOpen}
        {...(!isStuck && {
          color: textColor,
          colorScheme: buttonColorScheme,
        })}
        {...props}
      >
        New message
      </Button>

      <Modal isOpen={isOpen} onClose={onClose} size="xl">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Send new message</ModalHeader>
          <ModalCloseButton />

          <ModalBody>
            <FormProvider {...methods}>
              <Stack spacing={6}>
                <Stack>
                  <FormControl isRequired isInvalid={!!errors.roleIds}>
                    <FormLabel>Recipient roles</FormLabel>
                    <RoleIdsSelect />
                    <FormErrorMessage>{errors.roleIds?.message}</FormErrorMessage>

                    <Text colorScheme="gray" pt={2}>
                      <Text
                        as="span"
                        fontWeight="bold"
                        color={reachableUsers?.length > 0 && greenTextColor}
                      >
                        {isReachableUsersLoading ? (
                          <Spinner size="xs" />
                        ) : (
                          reachableUsers?.length ?? 0
                        )}
                      </Text>
                      <Text
                        as="span"
                        color={reachableUsers?.length > 0 && greenTextColor}
                      >
                        {" reachable "}
                      </Text>
                      <Text as="span" color="chakra-body-text">
                        {"/ "}
                      </Text>
                      <Text as="span" fontWeight="bold">
                        {isTargetedCountValidating ? (
                          <Spinner size="xs" />
                        ) : (
                          targetedCount
                        )}
                      </Text>
                      {" targeted"}
                    </Text>
                  </FormControl>

                  <Text>
                    {`You can only message users who've subscribed to the Guild.xyz app on `}
                    <Link href="https://web3inbox.com" colorScheme="blue" isExternal>
                      Web3Inbox
                    </Link>
                    {`. They can do it from the notifications menu easily!`}
                  </Text>
                </Stack>

                <FormControl isRequired isInvalid={!!errors.message}>
                  <FormLabel>Message</FormLabel>
                  <Textarea
                    placeholder="Write your message here"
                    {...register("message", {
                      required: "This field is required",
                      maxLength: {
                        value: 255,
                        message:
                          "Maximum Web3Inbox message length is 255 characters",
                      },
                    })}
                  />
                  <FormErrorMessage>{errors.message?.message}</FormErrorMessage>
                </FormControl>
              </Stack>
            </FormProvider>
          </ModalBody>

          <ModalFooter>
            <Button
              ml="auto"
              h={10}
              colorScheme="green"
              rightIcon={<PaperPlaneRight />}
              onClick={handleSubmit(onSubmit)}
              isLoading={isLoading}
              loadingText="Sending"
            >
              Send
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  )
}

export default SendNewMessage
