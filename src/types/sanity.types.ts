/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/member-ordering */
/* eslint-disable perfectionist/sort-interfaces */

export interface SanityRichText {
    _type: string;
    _id: string;
    title: string;
    _updatedAt: string;
    content: SanityContent[];
    createdDate?: string;
    lastUpdated?: string;
    _createdAt: string;
    _rev: string;
}

export interface SanityContent {
    _type: string;
    style: string;
    _key: string;
    markDefs: any[];
    children: SanityContentChildren[];
}

export interface SanityContentChildren {
    _type: 'span';
    marks: string[];
    text: string;
    _key: string;
}

export type FormattedSanityRichText = SanityHeadingBlock | SanityParagraphBlock;

export interface SanityHeadingBlock {
    content: string;
    style: string[];
    type: 'heading';
}

export interface SanityParagraphBlock {
    content: SanityParagraphBlockChild[];
    style: string[];
    type: 'paragraph';
}

export interface SanityParagraphBlockChild {
    content: string;
    style: string[];
    type: 'paragraph';
}
