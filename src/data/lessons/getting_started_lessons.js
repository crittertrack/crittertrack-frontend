export const GETTING_STARTED_LESSONS = [
  {
    id: 'getting-started-layout-tour',
    title: 'Getting Around CritterTrack',
  description: 'Get familiar with the navigation, menus, and shortcuts you will use throughout CritterTrack.',
  steps: [
      {
       stepNumber: 1,
      title: 'Main navigation',
      content: 'The navigation bar at the top gives you access to Animals, Litters, Contacts, Marketplace, Calendar, Community, Tools, and Finance. Most open their own page, while Community, Tools, and Finance have dropdown menus with additional options.',
      },
      {
        stepNumber: 2,
      title: 'News and alerts',
      content: 'Above the navigation bar, you will find a scrolling banner with community announcements, polls, and useful links such as Ko-fi, Report a Bug, and Helpful Resources. Just below the navigation bar is a separate alerts banner for unread messages, notifications, and animal care reminders.',
      },
      {
       stepNumber: 3,
      title: 'Tools menu',
      content: 'The Tools menu contains the Offspring Calculator, COI Calculator, Target Outcome Calculator, and Family Tree Explorer. You can find the Help Center in your profile menu.',
      },
      {
      stepNumber: 4,
      title: 'Finance menu',
      content: 'The Finance menu gives you access to the Budget Tracker, Supplies, and Waitlist & Reservations. Use the Budget Tracker to keep track of income and expenses, Supplies to manage your inventory, and Waitlist & Reservations to organize interested buyers, track reservations, and manage waiting lists for your animals.',
      },      
 {
      stepNumber: 5,
      title: 'Top-right icons',
      content: 'The icons in the top-right corner let you change your theme (light, dark, or automatic), toggle push notifications for your device, switch between Full and Lite mode using the feather icon, check your notifications, and open your messages. A purple badge shows unread notifications or messages from other users, while a red message badge indicates a message from CritterTrack staff. Lite mode keeps the essentials, including Animals and Litters, while hiding additional features until you switch back. Your Lite mode preference follows your account across the website and Android app, and switching modes never deletes your information. See the "Lite Mode" lesson under More Pages & Tools for details.',
    },
{
      stepNumber: 6,
      title: 'Your profile menu',
      content: 'Click your profile picture in the top-right corner to open your account menu. From here, you can visit your profile, open the Help Center, report an issue, or log out.',
    },
{
      stepNumber: 7,
      title: 'Info buttons',
      content: 'You will notice small ⓘ icons on different pages throughout CritterTrack. Click one for a quick explanation of that feature. Where a more detailed guide is available, you can follow the link directly to the relevant Help Center article.',
    },
{
      stepNumber: 8,
      title: 'Searching for animals and breeders',
      content: 'Use the search bar in the header to find public animals and breeder profiles. You can search by name, species, or public ID. Text searches require at least two characters. Animal IDs begin with CTC, while breeder profile IDs begin with CTU.',
    },
      ],
  },
  {
id: 'getting-started-animals',
  title: 'Creating and Editing Animals',
  description: 'Learn how to add animals, update their information, link parents, and manage visibility and ownership.',
  steps: [
 {
      stepNumber: 1,
      title: 'Adding a new animal',
      content: 'Click "⊕ Add Animal" at the top right of the page. On mobile this shows just "⊕ Animal" instead.',
    },
          {
        stepNumber: 2,
        title: 'Pick a species',
        content: 'This opens the Select Species screen first. Start by selecting the species you want to add. You can search by name, browse by category, or mark frequently used species as favorites for quicker access next time. If your species is missing, click "Add New Species" to create a custom one.',
      },
      {
        stepNumber: 3,
        title: 'Fill out the new animal form',
        content: 'Picking a species opens the "Add New [Species]" form. Name is the only field you truly have to fill in • everything else can be filled in now or left for later.',
      },

    {
      stepNumber: 4,
      title: 'Exploring the different tabs',
      content: 'The form is divided into tabs: Dashboard, Identification, Appearance, Health, Routine Care, Behavior, Breeding, Pedigree, Gallery, Timeline, and Records. There is also a Customize tab where you can hide tabs or sections you don\'t use for that species. You don\'t have to complete everything at once. Save your animal and return whenever you want to add more information.',
    },
 {
      stepNumber: 5,
      title: 'Editing an existing animal',
      content: 'To make changes to an animal you\'ve already added, open its record by clicking the animal card and click "Edit" in the header. This opens the same form, with all previously saved information ready to update.',
    },
 {
      stepNumber: 6,
      title: 'Linking parents and ancestors',
      content: 'Open the Pedigree tab to connect an animal to its sire, dam, and earlier ancestors. Click an ancestor slot to search for an existing animal on CritterTrack. You can link your own animals or public animals belonging to other users. Search results are filtered by the appropriate gender for each slot. If an ancestor isn\'t on CritterTrack yet, you\'ll need to create a record for it first. Linked ancestors are used throughout the pedigree, including parent cards, family trees, and COI/AVK calculations.',
    },
{
  stepNumber: 7,
  title: 'Public and private animals',
  content: 'Each animal has its own visibility setting, shown by the eye icon on its card in My Animals. A green eye means Public, while a gray crossed-out eye means Private. Public animals can be found through searches and viewed through other animals\' pedigrees, even if they are marked as Unowned. To appear on your public breeder profile, an animal must be both Public and Owned. Private animals are entirely hidden from other users, regardless of their ownership setting. You can change both settings individually for each animal.',
},

{
  stepNumber: 8,
  title: 'Owned, Unowned, and the Owned/All filter',
  content: 'Every animal you create is marked as Owned by default and appears in the "Owned" view of My Animals. You can change this using the heart icon on its card. Mark an animal as Unowned if you want to keep its record without including it among the animals you currently own. The Owned/All toggle at the top of My Animals controls which records are displayed: "Owned" shows only animals marked as Owned, while "All" shows every animal you\'ve created, whether Owned or Unowned. Archived or transferred animals are excluded from the My Animals view and can be found separately under Archived. Changing the heart setting only affects the ownership label and does not archive, sell, or transfer an animal. You can also change the Owned status of multiple animals at once using bulk actions.',
},
{
      stepNumber: 9,
      title: 'Other features connected to animal records',
      content: 'You can also manage enclosure assignments, health and quarantine information, treatments, feeding and care schedules, breeding lines, Marketplace availability, and seller or buyer details from the animal form. These features also have their own dedicated pages for day-to-day management, which are explained in other Help Center lessons.',
    },
      ],
  },
  {
    id: 'getting-started-transfers',
    title: 'Transferring Animal Ownership',
 description: 'Learn how to transfer an animal to another CritterTrack user, manage pending transfers, and understand what happens to its records.',
     steps: [
      {
        stepNumber: 1,
        title: 'Starting a transfer',
     content: 'Open the animal you want to transfer and click the two-way-arrows "Transfer" button in its header, next to Edit. This opens the Transfer Ownership window, where you can choose the user who will receive the animal.',      },
      {
        stepNumber: 2,
        title: 'Choosing the new owner',
        content: 'Clicking Transfer opens a modal showing the animal\'s photo and info at the top, Search for the recipient by their name or CTU ID and select the correct user from the results. You can also enter an optional sale price and add a note for the recipient. Once everything looks correct, send the transfer request.',      
      },
    {
      stepNumber: 3,
      title: 'Waiting for a response',
      content: 'Sending a transfer request does not immediately change ownership. The recipient receives a notification and can choose to Accept or Decline. Until they accept, the animal remains in your account and you can continue managing its records.',
    },      
    {
      stepNumber: 4,
      title: 'Cancelling a pending transfer',
      content: 'Changed your mind? While the recipient has not responded, the two-way-arrow Transfer button changes to a red button with a circular arrow. Click it to cancel the pending request and keep the animal in your account.',
    },
    {
      stepNumber: 5,
      title: 'What happens after acceptance?',
      content: 'Once the recipient accepts, they become the new owner and receive full editing access to the animal. The animal is removed from your active My Animals list and can be found under Sold/Archived instead. You remain listed as the original breeder and keep permanent view-only access to the record, allowing its pedigree and history to remain connected.',
    },
{
      stepNumber: 6,
      title: 'Returning an animal to its original breeder',
      content: 'If an animal was transferred to you, the transfer button turns into a return button with a yellow/red circular arrow. In edit the delete button also gets replaced with a "Return to Original Breeder" button. You can use this to request a transfer back to the original breeder. Just like a regular transfer, the animal does not change hands immediately.',
    },
 {
      stepNumber: 7,
      title: 'Accepting or declining a return',
      content: 'When someone requests to return an animal to you, you will receive a notification under Pending Requests. You can Accept or Decline the return. Ownership only changes once you accept, and the animal will then become available in your active records again.',
    },
      ],
  },
  {
    id: 'getting-started-account-settings',
    title: 'Account Settings & the Breeder Registry',
  description: 'Manage your profile, choose what other users can see, and set your breeding status for each species.',
      steps: [
{
      stepNumber: 1,
      title: 'Opening your account settings',
      content: 'Click your profile picture in the top-right corner and select "Profile". From your profile page, click the "Profile Settings" button (gear icon) to open your settings.',
    },

    {
      stepNumber: 2,
      title: 'Exploring the settings tabs',
      content: 'Your settings are divided into eight tabs: Profile, Info & Adoption, Directory, Ratings, Breeding Lines, Dropdown Lists, Data Portability, and Account. The Dropdown Lists tab helps you manage values you\'ve entered in animal forms, such as colors or coat types. These values are saved per species and suggested when you use the same fields again. You can rename existing values to correct them across your animal records or remove values you no longer want suggested. New values are added automatically when you enter them in an animal form.',
    },
 {
      stepNumber: 3,
      title: 'Choosing what appears on your public profile',
      content: 'On the Profile tab, the "Public Profile Visibility" settings let you choose which details other users can see. You can show or hide your personal name, breeder name, email address, website, social media link, biography, and statistics tab. Your personal name is visible by default, while the other options can be enabled individually. The breeder name option only appears after you\'ve added a breeder name to your profile.',
    },
{
      stepNumber: 4,
      title: 'What happens if you hide both names?',
      content: 'You can hide both your personal name and breeder name, but doing so also hides your profile and your animals from public areas of CritterTrack. This includes the Breeders Registry, Community Feed, and Marketplace listings. To appear in these areas, at least one of your names must be visible.',
    },
     
{
  stepNumber: 5,
  title: 'Setting your breeding status',
  content: 'Open the "Breeder Settings" tab to manage your breeding status for each species you keep. You can choose Owner, Active Breeder, or Retired Breeder. Owner is the default and does not create a public listing. Choosing Active Breeder or Retired Breeder allows you to appear in the public "Breeders" list for that species, provided you have at least one public name on your profile. Click "Save Breeding Status" to save your changes.',
},

       {
      stepNumber: 6,
      title: 'Making sure your registry listing is visible',
      content: 'Choosing Active Breeder or Retired Breeder is only part of the process. You also need to make either your personal name or breeder name public in the Profile tab. If both names are hidden, your profile will not appear in registry searches, even if you\'ve selected a breeding status.',
    },
    ],
  },
  {
  id: 'getting-started-list-basics',
  title: 'My Animals: The Basics',
  description: 'Get familiar with your animal list, its quick statistics, and the different ways to view your records.',
  steps: [
    {
      stepNumber: 1,
      title: 'Understanding the overview',
      content: 'At the top of My Animals, you\'ll find five overview cards: Total Animals, Owned, Public, Sold/Archived, and Needs Attention. These give you a quick look at your records, and most can be clicked for a more detailed breakdown. Below them, the Owned/All toggle lets you choose which animals appear in your active lists. "Owned" shows only animals marked as Owned, while "All" includes every animal you\'ve created that hasn\'t been archived or transferred, whether marked as Owned or Unowned. This filter also applies to the other My Animals tabs.',
    },
    {
      stepNumber: 2,
      title: 'Finding and organizing your animals',
      content: 'You can search for animals, filter by species or other details, change the sorting order, and switch between Card and Table view. There are also options for updating several animals at once, organizing them into collections, and managing archived records. Each of these features is explained in more detail in the "The Animal List: A Tab-by-Tab Tour" section of the Help Center.',
    },
  ],
},
];