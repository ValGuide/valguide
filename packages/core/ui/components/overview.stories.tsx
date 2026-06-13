import type { Meta, StoryObj } from '@storybook/react'
import { format } from 'date-fns'
import {
  Bell,
  CalendarIcon,
  CircleAlert,
  CreditCard,
  FileText,
  FolderOpen,
  Globe,
  Grip,
  ImageIcon,
  Inbox,
  LayoutPanelTop,
  Mail,
  MoreHorizontal,
  Play,
  Search,
  ShieldAlert,
  Sparkles,
  User,
} from 'lucide-react'
import * as React from 'react'
import { cn } from '../lib/utils'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from './accordion'
import { Alert, AlertDescription, AlertTitle } from './alert'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from './alert-dialog'
import { AspectRatio } from './aspect-ratio'
import { Avatar, AvatarFallback, AvatarImage } from './avatar'
import { Badge } from './badge'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from './breadcrumb'
import { Button } from './button'
import { ButtonGroup, ButtonGroupSeparator, ButtonGroupText } from './button-group'
import { Calendar } from './calendar'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './card'
import { Checkbox } from './checkbox'
import { Command, CommandGroup, CommandInput, CommandItem, CommandList, CommandShortcut } from './command'
import { ContextMenu, ContextMenuContent, ContextMenuItem, ContextMenuTrigger } from './context-menu'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from './dialog'
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from './drawer'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './dropdown-menu'
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from './empty'
import { Field, FieldContent, FieldDescription, FieldError, FieldGroup, FieldLabel } from './field'
import { HoverCard, HoverCardContent, HoverCardTrigger } from './hover-card'
import { Input } from './input'
import { InputGroup, InputGroupAddon, InputGroupButton, InputGroupInput, InputGroupText } from './input-group'
import { InputOTP, InputOTPGroup, InputOTPSlot } from './input-otp'
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemGroup,
  ItemHeader,
  ItemMedia,
  ItemSeparator,
  ItemTitle,
} from './item'
import { Kbd, KbdGroup } from './kbd'
import { Menubar, MenubarContent, MenubarItem, MenubarMenu, MenubarTrigger } from './menubar'
import { MetadataGrid, MetadataRow } from './metadata-row'
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from './navigation-menu'
import { PageTitle } from './page-title'
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from './pagination'
import { PhoneInput } from './phone-input'
import { Popover, PopoverContent, PopoverTrigger } from './popover'
import { Progress } from './progress'
import { RadioGroup, RadioGroupItem } from './radio-group'
import {
  ResponsiveDialog,
  ResponsiveDialogBody,
  ResponsiveDialogContent,
  ResponsiveDialogDescription,
  ResponsiveDialogFooter,
  ResponsiveDialogHeader,
  ResponsiveDialogTitle,
  ResponsiveDialogTrigger,
} from './responsive-dialog'
import { RevealImage } from './reveal-image'
import { ScrollArea } from './scroll-area'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './select'
import { Separator } from './separator'
import { Sheet, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle, SheetTrigger } from './sheet'
import { Skeleton } from './skeleton'
import { Slider } from './slider'
import { Spinner } from './spinner'
import { StatusBadge } from './status-badge'
import { Switch } from './switch'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './table'
import { Tabs, TabsContent, TabsList, TabsTrigger } from './tabs'
import { Textarea } from './textarea'
import { Toggle } from './toggle'
import { ToggleGroup, ToggleGroupItem } from './toggle-group'
import { Tooltip, TooltipContent, TooltipTrigger } from './tooltip'

const meta = {
  title: 'Shared UI/Overview',
  component: UiComponentsOverview,
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof UiComponentsOverview>

export default meta

type Story = StoryObj<typeof meta>

const recentlyEditedStops = [
  'Entrance hall',
  'Main gallery',
  'Reading room',
  'Special exhibit',
  'Garden walk',
  'Archive wing',
  'Rooftop terrace',
  'Museum shop',
]

const componentInventory = Object.keys(import.meta.glob('./**/*.{ts,tsx}'))
  .filter(
    (filePath) =>
      !filePath.includes('.stories.') && !filePath.includes('.example.') && !filePath.endsWith('/README.md'),
  )
  .map((filePath) => filePath.replace(/^\.\//, '').replace(/\.(ts|tsx)$/, ''))
  .sort((left, right) => left.localeCompare(right))

const museumImageDataUri =
  'data:image/svg+xml;utf8,' +
  encodeURIComponent(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 560">
      <defs>
        <linearGradient id="bg" x1="0%" x2="100%" y1="0%" y2="100%">
          <stop offset="0%" stop-color="#f0ece4" />
          <stop offset="55%" stop-color="#dfd3c2" />
          <stop offset="100%" stop-color="#c9baa8" />
        </linearGradient>
      </defs>
      <rect width="800" height="560" fill="url(#bg)" rx="28" />
      <circle cx="612" cy="124" r="84" fill="#ffffff" fill-opacity="0.42" />
      <path d="M122 408c52-84 110-126 176-126 58 0 106 24 148 74 28 34 54 52 77 52 35 0 76-32 126-96l151 154H0l122-58Z" fill="#9d7654" fill-opacity="0.9"/>
      <path d="M196 212h126v148H196z" fill="#f8f4ee" stroke="#7d624b" stroke-width="12" rx="18"/>
      <path d="M238 256h42v62h-42z" fill="#d7c5b2"/>
      <path d="M394 168h164v192H394z" fill="#f8f4ee" stroke="#7d624b" stroke-width="12" rx="20"/>
      <circle cx="476" cy="256" r="52" fill="#cab7a4"/>
      <path d="M78 454h644" stroke="#705746" stroke-width="22" stroke-linecap="round"/>
    </svg>
  `)

function UiComponentsOverview() {
  const canvasRef = React.useRef<HTMLDivElement>(null)
  React.useLayoutEffect(() => {
    if (typeof window !== 'undefined' && 'scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'manual'
    }
    const reset = () => {
      canvasRef.current?.scrollTo({ left: 0, top: 0 })
      window.scrollTo(0, 0)
    }
    reset()
    const raf = requestAnimationFrame(reset)
    return () => cancelAnimationFrame(raf)
  }, [])

  return (
    <div ref={canvasRef} className="fixed inset-0 overflow-auto bg-muted/30">
      <div className="w-[1920px] space-y-6 p-8">
        <Hero />
        <MasonryColumns>
          <Tile title="Buttons">
            <div className="flex flex-wrap gap-2">
              <Button>Publish</Button>
              <Button variant="secondary">Review</Button>
              <Button variant="outline">Preview</Button>
              <Button variant="ghost">Skip</Button>
              <Button variant="link">Docs</Button>
            </div>
          </Tile>

          <Tile title="ButtonGroup">
            <ButtonGroup>
              <Button variant="outline">Back</Button>
              <Button variant="outline">Save draft</Button>
              <Button>Publish</Button>
            </ButtonGroup>
            <ButtonGroup>
              <ButtonGroupText>Auto-save · 2 min</ButtonGroupText>
              <ButtonGroupSeparator />
              <Button variant="outline">Disable</Button>
            </ButtonGroup>
          </Tile>

          <Tile title="Toggle + Kbd">
            <div className="flex flex-wrap gap-2">
              <Toggle variant="outline" defaultPressed>
                <LayoutPanelTop />
                Inspector
              </Toggle>
              <Toggle variant="outline">
                <Play />
                Preview
              </Toggle>
            </div>
            <div className="flex items-center gap-3 text-sm text-muted-foreground">
              <span>Quick publish</span>
              <KbdGroup>
                <Kbd>Cmd</Kbd>
                <Kbd>Shift</Kbd>
                <Kbd>P</Kbd>
              </KbdGroup>
            </div>
          </Tile>

          <Tile title="ToggleGroup">
            <ToggleGroup type="single" defaultValue="grid" variant="outline">
              <ToggleGroupItem value="grid">Grid</ToggleGroupItem>
              <ToggleGroupItem value="list">List</ToggleGroupItem>
              <ToggleGroupItem value="kanban">Board</ToggleGroupItem>
            </ToggleGroup>
          </Tile>

          <Tile title="Pagination">
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious href="#" />
                </PaginationItem>
                <PaginationItem>
                  <PaginationLink href="#">1</PaginationLink>
                </PaginationItem>
                <PaginationItem>
                  <PaginationLink href="#" isActive>
                    2
                  </PaginationLink>
                </PaginationItem>
                <PaginationItem>
                  <PaginationEllipsis />
                </PaginationItem>
                <PaginationItem>
                  <PaginationNext href="#" />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </Tile>

          <Tile title="Field + Input + Textarea">
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="overview-title">Title</FieldLabel>
                <FieldContent>
                  <Input id="overview-title" defaultValue="Main exhibition overview" />
                  <FieldDescription>Short labels stack cleanly.</FieldDescription>
                </FieldContent>
              </Field>
              <Field>
                <FieldLabel htmlFor="overview-description">Description</FieldLabel>
                <FieldContent>
                  <Textarea
                    id="overview-description"
                    defaultValue="A short, curator-facing explanation for the entry point."
                  />
                  <FieldError errors={[{ message: 'Description uses placeholder copy.' }]} />
                </FieldContent>
              </Field>
            </FieldGroup>
          </Tile>

          <Tile title="InputGroup + PhoneInput">
            <InputGroup>
              <InputGroupAddon>
                <InputGroupText>
                  <Search />
                </InputGroupText>
              </InputGroupAddon>
              <InputGroupInput defaultValue="Search stops, assets, tours" />
              <InputGroupAddon align="inline-end">
                <InputGroupButton size="icon-xs" aria-label="Run search">
                  <Sparkles />
                </InputGroupButton>
              </InputGroupAddon>
            </InputGroup>
            <PhoneInputExample />
          </Tile>

          <Tile title="Select">
            <Select defaultValue="curator">
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Choose a role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="curator">Curator</SelectItem>
                <SelectItem value="editor">Editor</SelectItem>
                <SelectItem value="translator">Translator</SelectItem>
              </SelectContent>
            </Select>
          </Tile>

          <Tile title="Calendar">
            <div className="rounded-lg border bg-background">
              <Calendar mode="single" selected={new Date(2026, 3, 21)} defaultMonth={new Date(2026, 3, 1)} />
            </div>
          </Tile>

          <Tile title="InputOTP">
            <InputOtpExample />
          </Tile>

          <Tile title="Checkbox + Switch">
            <div className="flex items-center justify-between rounded-lg border bg-background px-4 py-3">
              <div>
                <div className="text-sm font-medium">Publish translated stops</div>
                <div className="text-sm text-muted-foreground">Include all completed locales.</div>
              </div>
              <Switch defaultChecked />
            </div>
            <div className="flex items-center gap-3 text-sm">
              <Checkbox defaultChecked id="overview-notify-checkbox" />
              <label htmlFor="overview-notify-checkbox">Notify collaborators on release.</label>
            </div>
          </Tile>

          <Tile title="RadioGroup">
            <RadioGroup defaultValue="staged" className="gap-2">
              <div className="flex items-center gap-3 rounded-md border px-3 py-2 text-sm">
                <RadioGroupItem value="staged" id="overview-release-staged" />
                <label htmlFor="overview-release-staged">Staged release</label>
              </div>
              <div className="flex items-center gap-3 rounded-md border px-3 py-2 text-sm">
                <RadioGroupItem value="immediate" id="overview-release-immediate" />
                <label htmlFor="overview-release-immediate">Publish immediately</label>
              </div>
            </RadioGroup>
          </Tile>

          <Tile title="Slider">
            <Slider defaultValue={[68]} max={100} step={1} />
            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <span>Audio ducking</span>
              <span>68%</span>
            </div>
          </Tile>

          <Tile title="Breadcrumb + Tabs">
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbLink href="#">Tours</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbLink href="#">Exhibition</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbPage>Stops</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
            <Tabs defaultValue="overview">
              <TabsList>
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="stops">Stops</TabsTrigger>
                <TabsTrigger value="assets">Assets</TabsTrigger>
              </TabsList>
              <TabsContent
                value="overview"
                className="rounded-lg border bg-background p-3 text-sm text-muted-foreground"
              >
                Overview content stays lightweight.
              </TabsContent>
            </Tabs>
          </Tile>

          <Tile title="Accordion">
            <Accordion type="single" collapsible defaultValue="timing">
              <AccordionItem value="timing">
                <AccordionTrigger>Release timing</AccordionTrigger>
                <AccordionContent>
                  Coordinate translations, asset QA, and tour handoff before publishing.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="notes">
                <AccordionTrigger>Internal notes</AccordionTrigger>
                <AccordionContent>Keep curator notes visible to editors but hidden from visitors.</AccordionContent>
              </AccordionItem>
            </Accordion>
          </Tile>

          <Tile title="Command">
            <Command className="rounded-lg border bg-background">
              <CommandInput placeholder="Find actions" />
              <CommandList className="max-h-40">
                <CommandGroup heading="Suggested">
                  <CommandItem>
                    <FolderOpen />
                    Open unpublished stops
                    <CommandShortcut>⌘K</CommandShortcut>
                  </CommandItem>
                  <CommandItem>
                    <Sparkles />
                    Generate intro summary
                    <CommandShortcut>⌥G</CommandShortcut>
                  </CommandItem>
                </CommandGroup>
              </CommandList>
            </Command>
          </Tile>

          <Tile title="Menubar">
            <Menubar>
              <MenubarMenu>
                <MenubarTrigger>File</MenubarTrigger>
                <MenubarContent>
                  <MenubarItem>New draft</MenubarItem>
                  <MenubarItem>Duplicate tour</MenubarItem>
                </MenubarContent>
              </MenubarMenu>
              <MenubarMenu>
                <MenubarTrigger>View</MenubarTrigger>
                <MenubarContent>
                  <MenubarItem>Show metadata</MenubarItem>
                  <MenubarItem>Compact density</MenubarItem>
                </MenubarContent>
              </MenubarMenu>
            </Menubar>
          </Tile>

          <Tile title="NavigationMenu">
            <NavigationMenu viewport={false} className="justify-start">
              <NavigationMenuList>
                <NavigationMenuItem>
                  <NavigationMenuTrigger>Collections</NavigationMenuTrigger>
                  <NavigationMenuContent className="w-72">
                    <NavigationMenuLink href="#">
                      <span className="font-medium">Permanent collection</span>
                      <span className="text-muted-foreground">Stable exhibits and long-lived tours.</span>
                    </NavigationMenuLink>
                  </NavigationMenuContent>
                </NavigationMenuItem>
              </NavigationMenuList>
            </NavigationMenu>
          </Tile>

          <Tile title="ScrollArea">
            <ScrollArea className="h-36 rounded-lg border bg-background">
              <div className="space-y-2 p-3 text-sm">
                {recentlyEditedStops.map((stop) => (
                  <div className="rounded-md border px-3 py-2" key={stop}>
                    {stop}
                  </div>
                ))}
              </div>
            </ScrollArea>
          </Tile>

          <Tile title="Alert">
            <Alert>
              <Sparkles />
              <AlertTitle>Ready to publish</AlertTitle>
              <AlertDescription>Translated stops synced, alt text present.</AlertDescription>
            </Alert>
            <Alert variant="destructive">
              <ShieldAlert />
              <AlertTitle>Translation mismatch</AlertTitle>
              <AlertDescription>Two stop descriptions changed after locale review.</AlertDescription>
            </Alert>
          </Tile>

          <Tile title="Badge + StatusBadge">
            <div className="flex flex-wrap gap-2">
              <Badge>Featured</Badge>
              <Badge variant="secondary">Queued</Badge>
              <Badge variant="outline">Needs review</Badge>
              <StatusBadge status="published" />
              <StatusBadge status="modified" />
              <StatusBadge status="draft" />
            </div>
          </Tile>

          <Tile title="Progress + Spinner">
            <div className="flex items-center justify-between text-sm">
              <span>Publishing readiness</span>
              <span className="text-muted-foreground">82%</span>
            </div>
            <Progress value={82} />
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Spinner className="size-4" />
              Checking asset integrity…
            </div>
          </Tile>

          <Tile title="Skeleton + Separator">
            <div className="space-y-3">
              <Skeleton className="h-5 w-44" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
            </div>
            <Separator />
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <CalendarIcon className="size-4" />
              {format(new Date(2026, 3, 21), 'MMMM d, yyyy')}
            </div>
          </Tile>

          <Tile title="Item">
            <ItemGroup className="rounded-lg border bg-background">
              <Item size="sm">
                <ItemMedia variant="icon">
                  <FileText />
                </ItemMedia>
                <ItemContent>
                  <ItemHeader>
                    <ItemTitle>Introduction audio</ItemTitle>
                    <StatusBadge status="published" size="sm" />
                  </ItemHeader>
                  <ItemDescription>Master and transcripts in sync.</ItemDescription>
                </ItemContent>
                <ItemActions>
                  <Button variant="ghost" size="icon-sm">
                    <MoreHorizontal />
                  </Button>
                </ItemActions>
              </Item>
              <ItemSeparator />
              <Item size="sm">
                <ItemMedia variant="icon">
                  <ImageIcon />
                </ItemMedia>
                <ItemContent>
                  <ItemTitle>Gallery cover</ItemTitle>
                  <ItemDescription>Cropped, approved, ready.</ItemDescription>
                </ItemContent>
              </Item>
            </ItemGroup>
          </Tile>

          <Tile title="MetadataRow">
            <MetadataGrid className="gap-3">
              <MetadataRow label="Language" value="EN, DE, RM" icon={<Globe />} />
              <MetadataRow label="Length" value="16 stops" icon={<CalendarIcon />} />
              <MetadataRow label="Owner" value="Curatorial team" icon={<User />} />
              <MetadataRow label="Release" value="Spring 2026" icon={<Bell />} />
            </MetadataGrid>
          </Tile>

          <Tile title="Table">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Stop</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Audio</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell>Entrance</TableCell>
                  <TableCell>Published</TableCell>
                  <TableCell>02:14</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Main hall</TableCell>
                  <TableCell>Modified</TableCell>
                  <TableCell>03:06</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Closing room</TableCell>
                  <TableCell>Draft</TableCell>
                  <TableCell>01:38</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </Tile>

          <Tile title="Empty">
            <Empty className="border border-dashed bg-background">
              <EmptyHeader>
                <EmptyMedia variant="icon">
                  <Inbox />
                </EmptyMedia>
                <EmptyTitle>Empty</EmptyTitle>
                <EmptyDescription>No unpublished issues remain.</EmptyDescription>
              </EmptyHeader>
              <EmptyContent>
                <Button variant="outline">Review published tour</Button>
              </EmptyContent>
            </Empty>
          </Tile>

          <Tile title="Avatar">
            <div className="flex items-center gap-3">
              <Avatar className="size-12 border">
                <AvatarImage src={museumImageDataUri} alt="Curator" />
                <AvatarFallback>VG</AvatarFallback>
              </Avatar>
              <div>
                <div className="text-sm font-medium">Curatorial Studio</div>
                <div className="text-sm text-muted-foreground">Updated asset selection.</div>
              </div>
            </div>
          </Tile>

          <Tile title="AspectRatio + RevealImage">
            <AspectRatio ratio={16 / 10}>
              <RevealImage
                alt="Museum-inspired placeholder artwork"
                className="rounded-xl"
                containerClassName="rounded-xl"
                src={museumImageDataUri}
              />
            </AspectRatio>
          </Tile>

          <Tile title="PageTitle + SectionPanel">
            <PageTitle as="h2" size="md" weight="medium">
              Exhibition narratives
            </PageTitle>
            <p className="text-sm text-muted-foreground">
              Long-form headings can stay expressive without losing system consistency.
            </p>
          </Tile>

          <Tile title="Dialog">
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline" className="w-full justify-between">
                  Open Dialog
                  <Grip />
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Review publish summary</DialogTitle>
                  <DialogDescription>Check release details before sending the update.</DialogDescription>
                </DialogHeader>
                <DialogFooter>
                  <Button variant="outline">Close</Button>
                  <Button>Confirm</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </Tile>

          <Tile title="AlertDialog">
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="outline" className="w-full justify-between">
                  Open AlertDialog
                  <CircleAlert />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Archive draft branch?</AlertDialogTitle>
                  <AlertDialogDescription>Removes the unfinished draft from the workspace.</AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction variant="destructive">Archive</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </Tile>

          <Tile title="Sheet">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline" className="w-full justify-between">
                  Open Sheet
                  <LayoutPanelTop />
                </Button>
              </SheetTrigger>
              <SheetContent>
                <SheetHeader>
                  <SheetTitle>Inspector panel</SheetTitle>
                  <SheetDescription>Metadata lives comfortably in edge surfaces.</SheetDescription>
                </SheetHeader>
                <SheetFooter>
                  <Button variant="outline">Close</Button>
                </SheetFooter>
              </SheetContent>
            </Sheet>
          </Tile>

          <Tile title="Drawer">
            <Drawer>
              <DrawerTrigger asChild>
                <Button variant="outline" className="w-full justify-between">
                  Open Drawer
                  <CreditCard />
                </Button>
              </DrawerTrigger>
              <DrawerContent>
                <DrawerHeader>
                  <DrawerTitle>Mobile action sheet</DrawerTitle>
                  <DrawerDescription>Compact mobile presentation for the same action.</DrawerDescription>
                </DrawerHeader>
                <DrawerFooter>
                  <Button>Continue</Button>
                </DrawerFooter>
              </DrawerContent>
            </Drawer>
          </Tile>

          <Tile title="ResponsiveDialog">
            <ResponsiveDialog mobileVariant="sheet">
              <ResponsiveDialogTrigger asChild>
                <Button variant="outline" className="w-full justify-between">
                  Open ResponsiveDialog
                  <Mail />
                </Button>
              </ResponsiveDialogTrigger>
              <ResponsiveDialogContent>
                <ResponsiveDialogHeader>
                  <ResponsiveDialogTitle>Invite collaborator</ResponsiveDialogTitle>
                  <ResponsiveDialogDescription>Desktop dialog, mobile sheet.</ResponsiveDialogDescription>
                </ResponsiveDialogHeader>
                <ResponsiveDialogBody className="space-y-3">
                  <Input placeholder="name@museum.org" />
                  <Select defaultValue="editor">
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="editor">Editor</SelectItem>
                      <SelectItem value="translator">Translator</SelectItem>
                    </SelectContent>
                  </Select>
                </ResponsiveDialogBody>
                <ResponsiveDialogFooter>
                  <Button variant="outline">Cancel</Button>
                  <Button>Send invite</Button>
                </ResponsiveDialogFooter>
              </ResponsiveDialogContent>
            </ResponsiveDialog>
          </Tile>

          <Tile title="Popover">
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-full justify-between">
                  Open Popover
                  <CalendarIcon />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="space-y-2">
                <div className="text-sm font-medium">Schedule update</div>
                <div className="text-sm text-muted-foreground">Choose a release window.</div>
              </PopoverContent>
            </Popover>
          </Tile>

          <Tile title="DropdownMenu">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="w-full justify-between">
                  Open DropdownMenu
                  <MoreHorizontal />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuLabel>Asset actions</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>Rename</DropdownMenuItem>
                <DropdownMenuItem>Duplicate</DropdownMenuItem>
                <DropdownMenuItem>Archive</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </Tile>

          <Tile title="ContextMenu">
            <ContextMenu>
              <ContextMenuTrigger className="flex min-h-24 items-center justify-center rounded-lg border border-dashed bg-background px-4 text-center text-sm text-muted-foreground">
                Right-click this surface
              </ContextMenuTrigger>
              <ContextMenuContent>
                <ContextMenuItem>Open details</ContextMenuItem>
                <ContextMenuItem>Copy link</ContextMenuItem>
                <ContextMenuItem>Remove from batch</ContextMenuItem>
              </ContextMenuContent>
            </ContextMenu>
          </Tile>

          <Tile title="Tooltip">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="outline" className="w-full">
                  Hover for Tooltip
                </Button>
              </TooltipTrigger>
              <TooltipContent>Quick action hint with short-form guidance.</TooltipContent>
            </Tooltip>
          </Tile>

          <Tile title="HoverCard">
            <HoverCard>
              <HoverCardTrigger asChild>
                <Button variant="outline" className="w-full">
                  Hover for HoverCard
                </Button>
              </HoverCardTrigger>
              <HoverCardContent className="space-y-2">
                <div className="text-sm font-medium">Collaboration summary</div>
                <div className="text-sm text-muted-foreground">Three editors touched this tour in 24 hours.</div>
              </HoverCardContent>
            </HoverCard>
          </Tile>

          <Tile title="Inventory">
            <div className="flex flex-wrap gap-1.5">
              {componentInventory.map((name) => (
                <span
                  className="rounded-full border border-border/80 bg-background px-2 py-0.5 font-mono text-[10px] text-muted-foreground"
                  key={name}
                >
                  {name}
                </span>
              ))}
            </div>
          </Tile>
        </MasonryColumns>
      </div>
    </div>
  )
}

const COLUMN_KEYS = ['alpha', 'beta', 'gamma', 'delta'] as const

function MasonryColumns({ children }: { children: React.ReactNode }) {
  const items = React.Children.toArray(children)
  const columns: React.ReactNode[][] = COLUMN_KEYS.map(() => [])
  items.forEach((item, index) => {
    columns[index % COLUMN_KEYS.length]?.push(item)
  })
  return (
    <div className="grid grid-cols-4 gap-6">
      {COLUMN_KEYS.map((columnKey, columnIndex) => (
        <div className="flex flex-col gap-6" key={columnKey}>
          {columns[columnIndex]}
        </div>
      ))}
    </div>
  )
}

function Hero() {
  return (
    <Card className="border-border/70 bg-background/92 shadow-[0_32px_80px_rgba(15,23,42,0.08)] backdrop-blur">
      <CardHeader className="gap-4">
        <Badge variant="outline" className="w-fit rounded-full px-3 py-1 text-[11px] uppercase tracking-[0.22em]">
          packages/core/ui/components
        </Badge>
        <PageTitle size="lg" weight="semibold">
          UI Component Overview
        </PageTitle>
        <CardDescription className="max-w-3xl text-sm md:text-base">
          A single 2D-scrollable canvas showing every core primitive. Scroll horizontally and vertically — the canvas is
          wider than the viewport on purpose.
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="grid gap-3 md:grid-cols-3">
          <HeroStat label="Primitives" value={`${componentInventory.length} files`} />
          <HeroStat label="Layout" value="Masonry · 4 columns · 1920px wide" />
          <HeroStat label="Theme" value="Storybook toolbar · locale + theme" />
        </div>
      </CardContent>
    </Card>
  )
}

function HeroStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-border/70 bg-muted/20 px-4 py-3">
      <div className="text-[11px] font-medium uppercase tracking-[0.18em] text-muted-foreground">{label}</div>
      <div className="mt-1.5 text-base font-semibold tracking-tight">{value}</div>
    </div>
  )
}

function Tile({ title, children, className }: React.PropsWithChildren<{ title: string; className?: string }>) {
  return (
    <Card className={cn('overflow-hidden border-border/70 bg-background', className)}>
      <CardHeader className="border-b border-border/60 bg-muted/20 py-3">
        <CardTitle className="text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">{title}</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-3 p-4">{children}</CardContent>
    </Card>
  )
}

function PhoneInputExample() {
  const [phone, setPhone] = React.useState<string | undefined>('+12025550186')
  return <PhoneInput defaultCountry="US" value={phone} onChange={(value) => setPhone(value ?? undefined)} />
}

function InputOtpExample() {
  const [otp, setOtp] = React.useState('190624')
  return (
    <InputOTP maxLength={6} value={otp} onChange={setOtp} containerClassName="justify-start gap-2">
      <InputOTPGroup className="gap-1.5">
        <InputOTPSlot index={0} />
        <InputOTPSlot index={1} />
        <InputOTPSlot index={2} />
      </InputOTPGroup>
      <InputOTPGroup className="gap-1.5">
        <InputOTPSlot index={3} />
        <InputOTPSlot index={4} />
        <InputOTPSlot index={5} />
      </InputOTPGroup>
    </InputOTP>
  )
}

export const Overview: Story = {}
