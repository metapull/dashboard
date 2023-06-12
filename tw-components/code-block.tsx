import { Text } from "./text";
import {
  Box,
  Code,
  CodeProps,
  Icon,
  IconButton,
  useClipboard,
  useColorModeValue,
} from "@chakra-ui/react";
import { IoMdCheckmark } from "@react-icons/all-files/io/IoMdCheckmark";
import { Highlight, Prism, themes } from "prism-react-renderer";
import { useCallback, useEffect } from "react";
import { FiCopy, FiLink } from "react-icons/fi";

const darkThemeDefault = themes.vsDark;
const lightThemeDefault = themes.vsLight;

type PrismTheme = typeof darkThemeDefault;

// add solidity lang support for code
(typeof global !== "undefined" ? global : window).Prism = Prism;
require("prismjs/components/prism-solidity");
// end add solidity support

export interface CodeBlockProps extends Omit<CodeProps, "size"> {
  code: string;
  language: string;
  canCopy?: boolean;
  previewLink?: string;
  wrap?: boolean;
  prefix?: string;
  darkTheme?: PrismTheme;
  lightTheme?: PrismTheme;
}
export const CodeBlock: React.FC<CodeBlockProps> = ({
  code,
  language,
  px = 4,
  py = 2,
  w = "full",
  borderRadius = "md",
  borderColor = "borderColor",
  borderWidth = "1px",
  fontFamily = "mono",
  backgroundColor,
  prefix,
  canCopy = true,
  previewLink = undefined,
  wrap = true,
  darkTheme,
  lightTheme,
  ...restCodeProps
}) => {
  const theme = useColorModeValue(
    lightTheme || lightThemeDefault,
    darkTheme || darkThemeDefault,
  );
  const { onCopy, hasCopied, setValue } = useClipboard(code);
  const onClickIPFSLink = useCallback(() => {
    window.open(previewLink, "_blank");
  }, [previewLink]);

  useEffect(() => {
    if (code) {
      setValue(code);
    }
  }, [code, setValue]);

  return (
    <Highlight
      code={prefix ? `${prefix} ${code}` : code}
      language={language}
      theme={{
        ...theme,
        plain: {
          backgroundColor:
            (backgroundColor as string) ||
            "var(--chakra-colors-backgroundHighlight)",
        },
      }}
    >
      {({ className, style, tokens, getLineProps, getTokenProps }) => (
        <Text
          borderRadius={borderRadius}
          py={py}
          px={px}
          w={w}
          borderWidth={borderWidth}
          borderColor={borderColor}
          position="relative"
          className={className}
          style={style}
          fontFamily={fontFamily}
          whiteSpace={wrap ? "pre-wrap" : "pre"}
          {...restCodeProps}
          as={Code}
        >
          {previewLink && (
            <IconButton
              mr={-2}
              onClick={onClickIPFSLink}
              position="relative"
              float="right"
              aria-label="Preview"
              borderRadius="md"
              variant="ghost"
              colorScheme="gray"
              size="sm"
              icon={<Icon as={FiLink} />}
            />
          )}

          {canCopy && code && (
            <IconButton
              mr={-2}
              onClick={onCopy}
              position="relative"
              float="right"
              aria-label="Copy"
              borderRadius="md"
              variant="ghost"
              colorScheme="gray"
              size="sm"
              icon={
                <Icon
                  as={hasCopied ? IoMdCheckmark : FiCopy}
                  fill={hasCopied ? "green.500" : undefined}
                />
              }
            />
          )}
          <Box as="span" display="block" my={1} color="heading" h="full">
            {tokens.map((line, i) => (
              // eslint-disable-next-line react/jsx-key
              <Box {...getLineProps({ line, key: i })}>
                {line.map((token, key) => (
                  // eslint-disable-next-line react/jsx-key
                  <span {...getTokenProps({ token, key })} />
                ))}
              </Box>
            ))}
          </Box>
        </Text>
      )}
    </Highlight>
  );
};
