import ReactMarkdown, { defaultUrlTransform } from "react-markdown";
import remarkGfm from "remark-gfm";

/**
 * A repository README rendered like GitHub does, minus raw HTML (react-markdown drops it, which
 * keeps this safe). Relative links and images resolve against the repo's default branch.
 */
const RepoReadme = ({ markdown, fullName, branch }: { markdown: string; fullName: string; branch: string }) => {
  const resolve = (url: string, kind: "link" | "image") => {
    if (/^(https?:|mailto:|#)/i.test(url)) return defaultUrlTransform(url);
    const path = url.replace(/^\.?\//, "");
    return kind === "image"
      ? `https://raw.githubusercontent.com/${fullName}/${branch}/${path}`
      : `https://github.com/${fullName}/blob/${branch}/${path}`;
  };

  return (
    <div
      className={[
        "min-w-0 text-sm leading-relaxed text-foreground/90",
        "[&>*:first-child]:mt-0",
        "[&_h1]:mb-3 [&_h1]:mt-6 [&_h1]:border-b [&_h1]:border-border/60 [&_h1]:pb-2 [&_h1]:text-2xl [&_h1]:font-semibold [&_h1]:tracking-tight [&_h1]:text-foreground",
        "[&_h2]:mb-2.5 [&_h2]:mt-6 [&_h2]:border-b [&_h2]:border-border/60 [&_h2]:pb-1.5 [&_h2]:text-lg [&_h2]:font-semibold [&_h2]:text-foreground",
        "[&_h3]:mb-2 [&_h3]:mt-5 [&_h3]:text-base [&_h3]:font-semibold [&_h3]:text-foreground",
        "[&_h4]:mb-2 [&_h4]:mt-4 [&_h4]:font-semibold",
        "[&_p]:my-3 [&_p]:max-w-[80ch]",
        "[&_a]:text-primary [&_a]:underline-offset-2 hover:[&_a]:underline",
        "[&_ul]:my-3 [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:my-3 [&_ol]:list-decimal [&_ol]:pl-5 [&_li]:my-1 [&_li>p]:my-1",
        "[&_li:has(>input)]:list-none [&_li>input]:mr-2 [&_li>input]:accent-primary",
        "[&_blockquote]:my-3 [&_blockquote]:border-l-2 [&_blockquote]:border-border [&_blockquote]:pl-4 [&_blockquote]:text-muted-foreground",
        "[&_code]:rounded [&_code]:bg-muted [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:font-mono [&_code]:text-[0.85em]",
        "[&_pre]:my-3 [&_pre]:overflow-x-auto [&_pre]:rounded-lg [&_pre]:border [&_pre]:border-border/60 [&_pre]:bg-background/60 [&_pre]:p-3.5",
        "[&_pre_code]:bg-transparent [&_pre_code]:p-0 [&_pre_code]:text-[13px]",
        "[&_table]:my-3 [&_table]:block [&_table]:w-max [&_table]:max-w-full [&_table]:overflow-x-auto [&_table]:text-[13px]",
        "[&_th]:border [&_th]:border-border/60 [&_th]:bg-muted/40 [&_th]:px-3 [&_th]:py-1.5 [&_th]:text-left [&_th]:font-semibold",
        "[&_td]:border [&_td]:border-border/60 [&_td]:px-3 [&_td]:py-1.5",
        "[&_img]:inline [&_img]:max-w-full [&_img]:rounded",
        "[&_hr]:my-6 [&_hr]:border-border/60",
      ].join(" ")}
    >
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        urlTransform={(url, key) => resolve(url, key === "src" ? "image" : "link")}
        components={{
          a: ({ href, children }) => {
            const internal = href?.startsWith("#");
            return (
              <a href={href} {...(internal ? {} : { target: "_blank", rel: "noopener noreferrer" })}>
                {children}
              </a>
            );
          },
          img: ({ src, alt }) => <img src={src} alt={alt ?? ""} loading="lazy" />,
        }}
      >
        {markdown}
      </ReactMarkdown>
    </div>
  );
};

export default RepoReadme;
