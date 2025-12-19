import {
  Body,
  Button,
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

interface WelcomeEmailProps {
  name: string;
  verificationCode: string;
}

export const WelcomeEmail = ({ name, verificationCode }: WelcomeEmailProps) => (
  <Html>
    <Head />
    <Preview>Welcome to our community, {name}!</Preview>
    <Tailwind>
      <Body className="bg-gray-50 font-sans">
        <Container className="mx-auto my-8 max-w-2xl bg-white rounded-lg shadow-sm">
          <Section className="p-8">
            <Img
              src="https://github.com/bukinoshita.png?size=100"
              alt="Bu Kinoshita"
              className="inline-block w-28 h-28 rounded-full"
            />

            <Heading className="text-3xl font-bold text-gray-900 mb-6">Welcome, {name}! 🎉</Heading>

            <Text className="text-base text-gray-700 mb-4">
              We're thrilled to have you join our community! Your account has been successfully
              created and you're all set to get started.
            </Text>

            <Text className="text-base text-gray-700 mb-4">
              Thank you for signing up! To complete your registration, please verify your email
              address using the code below:
            </Text>

            <Section className="bg-gray-100 rounded-lg p-6 my-8 border-2 border-dashed border-gray-300">
              <Text className="text-4xl font-bold text-center text-gray-900 tracking-[18px] font-mono m-0">
                {verificationCode}
              </Text>
            </Section>

            <Text className="text-base text-gray-700 mb-6">
              Here are a few things you can do to get started:
            </Text>

            <Section className="mb-6">
              <Text className="text-base text-gray-700 mb-2">
                • Complete your profile to personalize your experience
              </Text>
              <Text className="text-base text-gray-700 mb-2">
                • Explore our features and discover what we offer
              </Text>
              <Text className="text-base text-gray-700 mb-2">
                • Connect with other members of the community
              </Text>
            </Section>

            <Section className="text-center my-8">
              <Button
                href="https://example.com/get-started"
                className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold inline-block no-underline"
              >
                Get Started Now
              </Button>
            </Section>

            <Text className="text-base text-gray-700 mb-4">
              If you have any questions or need assistance, feel free to reach out to our support
              team.
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

export default WelcomeEmail;
