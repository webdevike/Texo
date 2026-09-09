import {
  fields,
  identifier,
  object,
  point,
  type CanvasPoint,
} from './canvas-document';

/**
 * A described interaction on a designed page. It records what Isaac asked for
 * on an element; it never wires that behavior up. `target` is the dotted key
 * of nested `data-target` attributes on the page (`table.row`), `record` pins
 * the request to one rendered record (a customer id) or, when null, to every
 * record the target renders.
 */
export type PrototypeComment = {
  id: string;
  page: string;
  target: string;
  targetLabel: string;
  record: string | null;
  recordLabel: string | null;
  anchor: CanvasPoint;
  body: string;
  resolved: boolean;
};

export type PrototypeDocument = {
  version: 1;
  comments: PrototypeComment[];
};

export const MAX_COMMENT_LENGTH = 4000;

function label(value: unknown, name: string): asserts value is string {
  if (typeof value !== 'string' || !value.trim() || value.length > 200)
    throw new Error(
      `${name} must be a nonempty string of at most 200 characters.`,
    );
}

export function validatePrototypeDocument(
  value: unknown,
): asserts value is PrototypeDocument {
  object(value, 'Document');
  fields(value, ['version', 'comments'], 'Document');
  if (value.version !== 1) throw new Error('Document version must be 1.');
  if (!Array.isArray(value.comments))
    throw new Error('Comments must be an array.');
  const ids = new Set<string>();
  for (const comment of value.comments) {
    object(comment, 'Comment');
    fields(
      comment,
      [
        'id',
        'page',
        'target',
        'targetLabel',
        'record',
        'recordLabel',
        'anchor',
        'body',
        'resolved',
      ],
      'Comment',
    );
    identifier(comment.id, 'Comment ID');
    if (ids.has(comment.id))
      throw new Error(`Comment ID duplicates "${comment.id}".`);
    ids.add(comment.id);
    identifier(comment.page, 'Comment page');
    identifier(comment.target, 'Comment target');
    label(comment.targetLabel, 'Comment target label');
    if (comment.record !== null) {
      identifier(comment.record, 'Comment record');
      label(comment.recordLabel, 'Comment record label');
    } else if (comment.recordLabel !== null) {
      throw new Error('Comment record label must be null without a record.');
    }
    point(comment.anchor, 0, 1, 'Comment anchor');
    if (
      typeof comment.body !== 'string' ||
      !comment.body.trim() ||
      comment.body !== comment.body.trim() ||
      comment.body.length > MAX_COMMENT_LENGTH
    ) {
      throw new Error(
        `Comment body must be trimmed, nonempty text of at most ${MAX_COMMENT_LENGTH} characters.`,
      );
    }
    if (typeof comment.resolved !== 'boolean')
      throw new Error('Comment resolved must be a boolean.');
  }
}

export const prototypeFile = {
  endpoint: '/__texo/prototype',
  label: 'project/prototype.json',
  validate: validatePrototypeDocument,
};
