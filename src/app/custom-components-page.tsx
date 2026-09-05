import { IconArrowRight, IconX } from '@tabler/icons-react';
import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  BaseActionIcon,
  BaseBox,
  BaseButton,
  BaseCard,
  BaseColorInput,
  BaseGroup,
  BaseSelect,
  BaseStack,
  BaseSwitch,
  BaseText,
  BaseTextInput,
  BaseTitle,
  TexoComponent,
  TexoIconPicker,
  type TexoIconValue,
  type TexoPropertyDefinition,
} from '@texo/ui';

import { projectComponents } from '../extensions/registry';
import classes from './custom-components-page.module.css';

function PropertyControl({ definition, onChange, value }: { definition: TexoPropertyDefinition; onChange: (value: unknown) => void; value: unknown }) {
  if (definition.type === 'boolean') return <BaseSwitch checked={Boolean(value)} label={definition.label} onChange={(event) => onChange(event.target.checked)} />;
  if (definition.type === 'enum') return <BaseSelect data={[...definition.options]} label={definition.label} value={String(value)} onChange={(next) => next && onChange(next)} />;
  if (definition.type === 'color') {
    const followsTheme = value === 'theme';
    return <BaseStack gap="xs"><BaseSwitch checked={followsTheme} label={`Use theme ${definition.label.toLowerCase()}`} onChange={(event) => onChange(event.target.checked ? 'theme' : '#228be6')} />{!followsTheme && <BaseColorInput label={definition.label} value={String(value)} onChange={onChange} />}</BaseStack>;
  }
  if (definition.type === 'icon') return <TexoIconPicker label={definition.label} onChange={onChange} value={value as TexoIconValue} />;
  return <BaseTextInput label={definition.label} max={definition.type === 'number' ? definition.max : undefined} min={definition.type === 'number' ? definition.min : undefined} onChange={(event) => onChange(definition.type === 'number' ? Number(event.target.value) : event.target.value)} type={definition.type === 'number' ? 'number' : 'text'} value={String(value)} />;
}

export function CustomComponentsPage() {
  const navigate = useNavigate();
  const { componentId } = useParams();
  const componentIds = Object.keys(projectComponents) as Array<keyof typeof projectComponents>;
  const selectedId = componentId && componentId in projectComponents ? componentId as keyof typeof projectComponents : null;
  const definition = selectedId ? projectComponents[selectedId] : null;
  const [propertiesOpened, setPropertiesOpened] = useState(true);
  const [propsById, setPropsById] = useState<Record<string, Record<string, unknown>>>({});
  const currentProps = definition && selectedId ? propsById[selectedId] ?? definition.defaultProps : {};
  const updateProp = (key: string, value: unknown) => selectedId && setPropsById((current) => ({ ...current, [selectedId]: { ...currentProps, [key]: value } }));

  if (!definition || !selectedId) {
    return (
      <BaseStack gap="lg">
        <div><BaseTitle order={2}>Custom components</BaseTitle><BaseText c="dimmed" size="sm">Project-owned components available to this application.</BaseText></div>
        <BaseBox className={classes.componentGrid}>
          {componentIds.map((id) => (
            <BaseCard className={classes.listCard} key={id} padding="md" withBorder>
              <BaseStack gap="md">
                <BaseText fw={600}>{projectComponents[id].name}</BaseText>
                <BaseBox className={classes.listPreview}><TexoComponent id={id} registry={projectComponents} /></BaseBox>
                <BaseButton onClick={() => navigate(`/custom/${id}`)} rightSection={<IconArrowRight size={15} />} variant="light">Open component</BaseButton>
              </BaseStack>
            </BaseCard>
          ))}
        </BaseBox>
      </BaseStack>
    );
  }

  return (
    <BaseBox className={classes.layout} data-properties-opened={propertiesOpened || undefined}>
      <BaseStack className={classes.preview} gap="lg">
        <BaseGroup align="flex-start" justify="space-between">
          <BaseTitle order={2}>{definition.name}</BaseTitle>
          {!propertiesOpened && <BaseButton onClick={() => setPropertiesOpened(true)} variant="default">Properties</BaseButton>}
        </BaseGroup>
        <BaseBox className={classes.stage}><TexoComponent id={selectedId} props={currentProps} registry={projectComponents} /></BaseBox>
      </BaseStack>

      <BaseBox aria-hidden={!propertiesOpened} className={classes.propertiesPanel}>
        <BaseGroup className={classes.propertiesHeader} justify="space-between" wrap="nowrap">
          <BaseText fw={600}>Properties</BaseText>
          <BaseActionIcon aria-label="Close properties" onClick={() => setPropertiesOpened(false)} variant="subtle"><IconX size={16} /></BaseActionIcon>
        </BaseGroup>
        <BaseStack className={classes.propertiesBody} gap="sm">
          {Object.entries(definition.properties).map(([key, property]) => <PropertyControl definition={property} key={key} onChange={(value) => updateProp(key, value)} value={currentProps[key]} />)}
        </BaseStack>
      </BaseBox>
    </BaseBox>
  );
}
