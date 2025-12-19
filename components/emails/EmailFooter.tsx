import { Column, Img, Link, Row, Text } from "@react-email/components";

export default function EmailFooter() {
  return (
    <Row className="text-center">
      <Column colSpan={4}>
        <Img
          src="https://github.com/bukinoshita.png?size=100"
          alt="Bu Kinoshita"
          className="inline-block w-18 h-18 rounded-full"
        />
        <Text className="my-2 font-semibold text-[18px] text-gray-900 leading-6">
          Acme corporation
        </Text>
        <Text className="mt-1 mb-0 text-[16px] text-gray-500 leading-6">Think different</Text>
      </Column>
      <Column align="left" className="table-cell align-bottom">
        <Row className="table-cell h-11 w-14 align-bottom">
          <Column className="pr-2">
            <Link href="#">
              <Img
                alt="Facebook"
                height="36"
                src="https://react.email/static/facebook-logo.png"
                width="36"
              />
            </Link>
          </Column>
          <Column className="pr-2">
            <Link href="#">
              <Img alt="X" height="36" src="https://react.email/static/x-logo.png" width="36" />
            </Link>
          </Column>
          <Column>
            <Link href="#">
              <Img
                alt="Instagram"
                height="36"
                src="https://react.email/static/instagram-logo.png"
                width="36"
              />
            </Link>
          </Column>
        </Row>
        <Row>
          <Text className="my-2 font-semibold text-[16px] text-gray-500 leading-6">
            123 Main Street Anytown, CA 12345
          </Text>
          <Text className="mt-1 mb-0 font-semibold text-[16px] text-gray-500 leading-6">
            {process.env.FROM_EMAIL} +123456789
          </Text>
        </Row>
      </Column>
    </Row>
  );
}
