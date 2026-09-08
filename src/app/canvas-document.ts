export type CanvasPoint = { x: number; y: number };

export type CanvasInstance = {
  id: string;
  componentId: string;
  props: Record<string, unknown>;
  position: CanvasPoint;
  width: number;
};

export type AnnotationTarget = {
  instanceId: string;
  target: string | null;
  anchor: CanvasPoint;
};

export type CanvasAnnotation = AnnotationTarget & {
  id: string;
  body: string;
  resolved: boolean;
};

export type CanvasDocument = {
  version: 1;
  instances: CanvasInstance[];
  annotations: CanvasAnnotation[];
};

function object(
  value: unknown,
  label: string,
): asserts value is Record<string, unknown> {
  if (
    !value ||
    typeof value !== 'object' ||
    Array.isArray(value) ||
    (Object.getPrototypeOf(value) !== Object.prototype &&
      Object.getPrototypeOf(value) !== null)
  ) {
    throw new Error(`${label} must be a plain object.`);
  }
}

function fields(
  value: Record<string, unknown>,
  expected: string[],
  label: string,
) {
  if (
    Reflect.ownKeys(value).length !== expected.length ||
    expected.some((key) => !Object.prototype.hasOwnProperty.call(value, key))
  ) {
    throw new Error(`${label} must contain exactly: ${expected.join(', ')}.`);
  }
}

function identifier(value: unknown, label: string): asserts value is string {
  if (typeof value !== 'string' || !value.trim() || value.length > 128) {
    throw new Error(
      `${label} must be a nonempty string of at most 128 characters.`,
    );
  }
}

function numberInRange(
  value: unknown,
  min: number,
  max: number,
  label: string,
) {
  if (
    typeof value !== 'number' ||
    !Number.isFinite(value) ||
    value < min ||
    value > max
  ) {
    throw new Error(
      `${label} must be a finite number between ${min} and ${max}.`,
    );
  }
}

function point(value: unknown, min: number, max: number, label: string) {
  object(value, label);
  fields(value, ['x', 'y'], label);
  numberInRange(value.x, min, max, `${label}.x`);
  numberInRange(value.y, min, max, `${label}.y`);
}

function jsonValue(value: unknown, ancestors: Set<object>) {
  if (value === null || typeof value === 'string' || typeof value === 'boolean')
    return;
  if (typeof value === 'number' && Number.isFinite(value)) return;
  if (!value || typeof value !== 'object')
    throw new Error('Props must contain only JSON-safe values.');
  if (ancestors.has(value))
    throw new Error('Props cannot contain circular references.');
  if (!Array.isArray(value)) object(value, 'Props value');
  if (Object.getOwnPropertySymbols(value).length)
    throw new Error('Props cannot contain symbol keys.');
  ancestors.add(value);
  if (Array.isArray(value)) {
    if (Object.keys(value).length !== value.length)
      throw new Error('Props arrays cannot contain holes or extra properties.');
    for (let index = 0; index < value.length; index++) {
      const descriptor = Object.getOwnPropertyDescriptor(value, String(index));
      if (!descriptor || !('value' in descriptor))
        throw new Error('Props cannot contain accessor properties.');
      jsonValue(descriptor.value, ancestors);
    }
  } else {
    for (const descriptor of Object.values(
      Object.getOwnPropertyDescriptors(value),
    )) {
      if (!descriptor.enumerable || !('value' in descriptor))
        throw new Error('Props must contain ordinary JSON properties.');
      jsonValue(descriptor.value, ancestors);
    }
  }
  ancestors.delete(value);
}

export function validateCanvasDocument(
  value: unknown,
): asserts value is CanvasDocument {
  object(value, 'Document');
  fields(value, ['version', 'instances', 'annotations'], 'Document');
  if (value.version !== 1) throw new Error('Document version must be 1.');
  if (!Array.isArray(value.instances))
    throw new Error('Instances must be an array.');
  if (!Array.isArray(value.annotations))
    throw new Error('Annotations must be an array.');
  const ids = new Set<string>();
  const uniqueId = (value: unknown, label: string) => {
    identifier(value, label);
    if (ids.has(value)) throw new Error(`${label} duplicates "${value}".`);
    ids.add(value);
  };
  for (const instance of value.instances) {
    object(instance, 'Instance');
    fields(
      instance,
      ['id', 'componentId', 'props', 'position', 'width'],
      'Instance',
    );
    uniqueId(instance.id, 'Instance ID');
    identifier(instance.componentId, 'Component ID');
    object(instance.props, 'Instance props');
    jsonValue(instance.props, new Set());
    point(instance.position, -1_000_000, 1_000_000, 'Instance position');
    numberInRange(instance.width, 40, 4000, 'Instance width');
  }
  for (const annotation of value.annotations) {
    object(annotation, 'Annotation');
    fields(
      annotation,
      ['id', 'instanceId', 'target', 'anchor', 'body', 'resolved'],
      'Annotation',
    );
    uniqueId(annotation.id, 'Annotation ID');
    identifier(annotation.instanceId, 'Annotation instance ID');
    if (annotation.target !== null)
      identifier(annotation.target, 'Annotation target');
    point(annotation.anchor, 0, 1, 'Annotation anchor');
    if (
      typeof annotation.body !== 'string' ||
      !annotation.body.trim() ||
      annotation.body !== annotation.body.trim() ||
      annotation.body.length > 4000
    ) {
      throw new Error(
        'Annotation body must be trimmed, nonempty text of at most 4000 characters.',
      );
    }
    if (typeof annotation.resolved !== 'boolean')
      throw new Error('Annotation resolved must be a boolean.');
  }
}
