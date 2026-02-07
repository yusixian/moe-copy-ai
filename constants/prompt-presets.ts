import type { PromptTemplate } from "./types"

interface PresetDefinition {
  id: string
  nameKey: string
  contentKey: string
  descKey: string
  icon: string
}

const PRESET_DEFINITIONS: PresetDefinition[] = [
  {
    id: "preset:summary",
    nameKey: "promptTemplate.preset.summary.name",
    contentKey: "promptTemplate.preset.summary.content",
    descKey: "promptTemplate.preset.summary.desc",
    icon: "mdi:text-box-outline"
  },
  {
    id: "preset:translate",
    nameKey: "promptTemplate.preset.translate.name",
    contentKey: "promptTemplate.preset.translate.content",
    descKey: "promptTemplate.preset.translate.desc",
    icon: "mdi:translate"
  },
  {
    id: "preset:keypoints",
    nameKey: "promptTemplate.preset.keypoints.name",
    contentKey: "promptTemplate.preset.keypoints.content",
    descKey: "promptTemplate.preset.keypoints.desc",
    icon: "mdi:format-list-bulleted"
  },
  {
    id: "preset:explain",
    nameKey: "promptTemplate.preset.explain.name",
    contentKey: "promptTemplate.preset.explain.content",
    descKey: "promptTemplate.preset.explain.desc",
    icon: "mdi:lightbulb-outline"
  },
  {
    id: "preset:rewrite",
    nameKey: "promptTemplate.preset.rewrite.name",
    contentKey: "promptTemplate.preset.rewrite.content",
    descKey: "promptTemplate.preset.rewrite.desc",
    icon: "mdi:pencil-outline"
  },
  {
    id: "preset:notes",
    nameKey: "promptTemplate.preset.notes.name",
    contentKey: "promptTemplate.preset.notes.content",
    descKey: "promptTemplate.preset.notes.desc",
    icon: "mdi:notebook-outline"
  },
  {
    id: "preset:social",
    nameKey: "promptTemplate.preset.social.name",
    contentKey: "promptTemplate.preset.social.content",
    descKey: "promptTemplate.preset.social.desc",
    icon: "mdi:share-variant-outline"
  },
  {
    id: "preset:glossary",
    nameKey: "promptTemplate.preset.glossary.name",
    contentKey: "promptTemplate.preset.glossary.content",
    descKey: "promptTemplate.preset.glossary.desc",
    icon: "mdi:book-alphabet"
  },
  {
    id: "preset:actions",
    nameKey: "promptTemplate.preset.actions.name",
    contentKey: "promptTemplate.preset.actions.content",
    descKey: "promptTemplate.preset.actions.desc",
    icon: "mdi:checkbox-marked-outline"
  }
]

export function getPresetTemplates(
  t: (key: string) => string
): PromptTemplate[] {
  return PRESET_DEFINITIONS.map((def) => ({
    id: def.id,
    name: t(def.nameKey),
    content: t(def.contentKey),
    isPreset: true,
    description: t(def.descKey),
    icon: def.icon
  }))
}

export const MAX_CUSTOM_TEMPLATES = 15
