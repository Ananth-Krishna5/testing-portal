import type { ComponentType, ReactElement } from "react";

const px = { nav: 20, inline: 16, toolbar: 22 } as const;

export type FluentIconSize = keyof typeof px;

export function FluentIcon({
  icon: Icon,
  size = "inline",
  color = "currentColor",
}: {
  icon: ComponentType<{ fontSize?: number; color?: string }>;
  size?: FluentIconSize;
  color?: string;
}): ReactElement {
  return <Icon fontSize={px[size]} color={color} />;
}
