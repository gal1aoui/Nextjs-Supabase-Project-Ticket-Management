import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Img,
  Preview,
  Section,
  Tailwind,
  Text,
} from "@react-email/components";
import EmailFooter from "./EmailFooter";

interface EmailVerificationProps {
  name: string;
  verificationCode: string;
}

export const EmailVerification = ({ name, verificationCode }: EmailVerificationProps) => (
  <Html>
    <Head />
    <Preview>Verify your email address - {verificationCode}</Preview>
    <Tailwind>
      <Body className="bg-gray-50 font-sans text-center">
        <Container className="mx-auto my-8 max-w-2xl bg-white rounded-lg shadow-sm">
          <Section className="p-8">
            <Img
              src="https://github.com/bukinoshita.png?size=100"
              alt="Bu Kinoshita"
              className="inline-block w-28 h-28 rounded-full"
            />

            <Heading className="text-3xl font-bold text-gray-900 mb-6">
              Verify Your Email Address
            </Heading>

            <Text className="text-base text-gray-700 mb-4">Hi {name},</Text>

            <Text className="text-base text-gray-700 mb-4">
              Thank you for signing up! To complete your registration, please verify your email
              address using the code below:
            </Text>

            <Section className="bg-gray-100 rounded-lg p-6 my-8 border-2 border-dashed border-gray-300">
              <Text className="text-4xl font-bold text-center text-gray-900 tracking-[18px] font-mono m-0">
                {verificationCode}
              </Text>
            </Section>

            <Text className="text-base text-gray-700 mb-4">
              This verification code will expire in 15 minutes for security purposes.
            </Text>

            <Text className="text-base text-gray-700 mb-6">
              If you didn't request this verification, please ignore this email.
            </Text>
          </Section>

          <Section className="bg-gray-100 px-8 py-6 border-t border-gray-200">
            <EmailFooter />
          </Section>
        </Container>
      </Body>
    </Tailwind>
  </Html>
);

export default EmailVerification;
