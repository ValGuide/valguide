// @ts-nocheck - Storybook types only available in storybook package
import type { Meta, StoryObj } from '@storybook/react'
import { StopsList } from './stops-list'
import type { StopWithTranslations } from '@valguide/core/features/guides/schema'

const meta = {
    title: 'Guides/StopsList',
    component: StopsList,
    parameters: {
        layout: 'padded',
    },
    tags: ['autodocs'],
    argTypes: {
        onReorder: { action: 'reorder' },
        onEdit: { action: 'edit' },
        onDelete: { action: 'delete' },
        onAdd: { action: 'add' },
    },
} satisfies Meta<typeof StopsList>

export default meta
type Story = StoryObj<typeof meta>

const mockStops: StopWithTranslations[] = [
    {
        id: '1',
        guideId: 'guide-1',
        nanoId: 'stop1',
        order: 0,
        createdAt: new Date('2025-01-10T10:00:00Z'),
        updatedAt: new Date('2025-01-10T10:00:00Z'),
        createdBy: 'user-1',
        translations: [
            {
                id: 't1',
                stopId: '1',
                locale: 'en',
                title: 'Museum Entrance',
                description: 'Welcome to the museum',
                transcription: null,
                createdAt: new Date('2025-01-10T10:00:00Z'),
                updatedAt: new Date('2025-01-10T10:00:00Z'),
            },
            {
                id: 't2',
                stopId: '1',
                locale: 'de',
                title: 'Museumseingang',
                description: 'Willkommen im Museum',
                transcription: null,
                createdAt: new Date('2025-01-10T10:00:00Z'),
                updatedAt: new Date('2025-01-10T10:00:00Z'),
            },
        ],
    },
    {
        id: '2',
        guideId: 'guide-1',
        nanoId: 'stop2',
        order: 1,
        createdAt: new Date('2025-01-10T11:00:00Z'),
        updatedAt: new Date('2025-01-10T11:00:00Z'),
        createdBy: 'user-1',
        translations: [
            {
                id: 't3',
                stopId: '2',
                locale: 'en',
                title: 'Ancient Artifacts Gallery',
                description: 'Explore artifacts from ancient civilizations',
                transcription: null,
                createdAt: new Date('2025-01-10T11:00:00Z'),
                updatedAt: new Date('2025-01-10T11:00:00Z'),
            },
            {
                id: 't4',
                stopId: '2',
                locale: 'de',
                title: 'Galerie antiker Artefakte',
                description: 'Erkunden Sie Artefakte aus alten Zivilisationen',
                transcription: null,
                createdAt: new Date('2025-01-10T11:00:00Z'),
                updatedAt: new Date('2025-01-10T11:00:00Z'),
            },
            {
                id: 't5',
                stopId: '2',
                locale: 'rm',
                title: 'Galaria dals artefacts antiqus',
                description: 'Explorar artefacts da civilisaziuns antichas',
                transcription: null,
                createdAt: new Date('2025-01-10T11:00:00Z'),
                updatedAt: new Date('2025-01-10T11:00:00Z'),
            },
        ],
    },
    {
        id: '3',
        guideId: 'guide-1',
        nanoId: 'stop3',
        order: 2,
        createdAt: new Date('2025-01-10T12:00:00Z'),
        updatedAt: new Date('2025-01-10T12:00:00Z'),
        createdBy: 'user-1',
        translations: [
            {
                id: 't6',
                stopId: '3',
                locale: 'en',
                title: 'Renaissance Art Wing',
                description: 'Masterpieces from the Renaissance period',
                transcription: null,
                createdAt: new Date('2025-01-10T12:00:00Z'),
                updatedAt: new Date('2025-01-10T12:00:00Z'),
            },
        ],
    },
]

const manyStops: StopWithTranslations[] = Array.from({ length: 15 }, (_, i) => ({
    id: `stop-${i + 1}`,
    guideId: 'guide-1',
    nanoId: `stop${i + 1}`,
    order: i,
    createdAt: new Date('2025-01-10T10:00:00Z'),
    updatedAt: new Date('2025-01-10T10:00:00Z'),
    createdBy: 'user-1',
    translations: [
        {
            id: `t-en-${i + 1}`,
            stopId: `stop-${i + 1}`,
            locale: 'en',
            title: `Stop ${i + 1}: Gallery ${String.fromCharCode(65 + (i % 26))}`,
            description: `Description for stop ${i + 1}`,
            transcription: null,
            createdAt: new Date('2025-01-10T10:00:00Z'),
            updatedAt: new Date('2025-01-10T10:00:00Z'),
        },
        {
            id: `t-de-${i + 1}`,
            stopId: `stop-${i + 1}`,
            locale: 'de',
            title: `Halt ${i + 1}: Galerie ${String.fromCharCode(65 + (i % 26))}`,
            description: `Beschreibung für Halt ${i + 1}`,
            transcription: null,
            createdAt: new Date('2025-01-10T10:00:00Z'),
            updatedAt: new Date('2025-01-10T10:00:00Z'),
        },
    ],
}))

export const Empty: Story = {
    args: {
        stops: [],
        locale: 'en',
        onReorder: () => { },
        onEdit: () => { },
        onDelete: () => { },
        onAdd: () => { },
    },
}

export const SingleStop: Story = {
    args: {
        stops: [mockStops[0]],
        locale: 'en',
        onReorder: () => { },
        onEdit: () => { },
        onDelete: () => { },
        onAdd: () => { },
    },
}

export const MultipleStops: Story = {
    args: {
        stops: mockStops,
        locale: 'en',
        onReorder: () => { },
        onEdit: () => { },
        onDelete: () => { },
        onAdd: () => { },
    },
}

export const ManyStops: Story = {
    args: {
        stops: manyStops,
        locale: 'en',
        onReorder: () => { },
        onEdit: () => { },
        onDelete: () => { },
        onAdd: () => { },
    },
}

export const GermanLocale: Story = {
    args: {
        stops: mockStops,
        locale: 'de',
        onReorder: () => { },
        onEdit: () => { },
        onDelete: () => { },
        onAdd: () => { },
    },
}

export const RomanshLocale: Story = {
    args: {
        stops: mockStops,
        locale: 'rm',
        onReorder: () => { },
        onEdit: () => { },
        onDelete: () => { },
        onAdd: () => { },
    },
}

export const MissingTranslation: Story = {
    args: {
        stops: [
            {
                id: '1',
                guideId: 'guide-1',
                nanoId: 'stop1',
                order: 0,
                createdAt: new Date('2025-01-10T10:00:00Z'),
                updatedAt: new Date('2025-01-10T10:00:00Z'),
                createdBy: 'user-1',
                translations: [
                    {
                        id: 't1',
                        stopId: '1',
                        locale: 'en',
                        title: 'Only English Available',
                        description: 'This stop only has English translation',
                        transcription: null,
                        createdAt: new Date('2025-01-10T10:00:00Z'),
                        updatedAt: new Date('2025-01-10T10:00:00Z'),
                    },
                ],
            },
        ],
        locale: 'de',
        onReorder: () => { },
        onEdit: () => { },
        onDelete: () => { },
        onAdd: () => { },
    },
}
