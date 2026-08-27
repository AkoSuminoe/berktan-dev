import { jsonLdScript, type JsonLdGraph } from '@/lib/jsonld';

/*
 * Server component. Emits one structured data block.
 *
 * The `dangerouslySetInnerHTML` here is the single sanctioned instance in the
 * codebase and the reasoning lives next to the serialiser in
 * `src/lib/jsonld.ts`. Read that before adding a second caller: the safety
 * argument is about where `data` comes from, not about this line.
 */
export default function JsonLd({ data }: { data: JsonLdGraph }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: jsonLdScript(data) }}
    />
  );
}
