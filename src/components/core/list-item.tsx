import { Button, HStack, Image, RNHostView, Spacer, Text, VStack } from "@expo/ui/swift-ui";
import { font, foregroundStyle, lineLimit } from "@expo/ui/swift-ui/modifiers";
import { Link, LinkProps } from "expo-router";
import { CoverArt } from "../feature/CoverArt/CoverArt";

export function ListItem({
  title,
  subtitle,
  coverId,
  ...rest
}: LinkProps & { title: string; subtitle: string; coverId: string }) {
  return (
    <Link {...rest} asChild>
      <Button>
        <HStack spacing={16}>
          <RNHostView matchContents>
            <CoverArt id={coverId} size={48} />
          </RNHostView>

          <VStack alignment="leading" spacing={2}>
            <Text
              modifiers={[
                foregroundStyle({ type: "color", color: "primary" }),
                font({ weight: "regular" }),
                lineLimit(1),
              ]}
            >
              {title}
            </Text>
            <Text modifiers={[foregroundStyle({ type: "color", color: "secondary" })]}>
              {subtitle}
            </Text>
          </VStack>
          <Spacer />
          <Image systemName="chevron.right" size={14} color="secondary" />
        </HStack>
      </Button>
    </Link>
  );
}
