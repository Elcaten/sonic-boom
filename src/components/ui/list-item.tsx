import { Button, HStack, Image, Spacer, Text, VStack } from "@expo/ui/swift-ui";
import { foregroundStyle, frame } from "@expo/ui/swift-ui/modifiers";
import { Link, LinkProps } from "expo-router";
import React from "react";
import { CoverArt } from "../CoverArt";

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
          <VStack modifiers={[frame({ width: 48, height: 48 })]}>
            <CoverArt id={coverId} size={48} />
          </VStack>

          <VStack alignment="leading" spacing={2}>
            <Text modifiers={[foregroundStyle({ type: "hierarchical", style: "primary" })]}>
              {title}
            </Text>
            <Text modifiers={[foregroundStyle({ type: "hierarchical", style: "secondary" })]}>
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
