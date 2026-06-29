export const initialContacts = [
  {
    id: 1,
    name: 'Alice',
    avatar: '',
    isGroup: false,
    messages: [
      { id: 1, text: 'Hey!', sender: 'Alice' },
      { id: 2, text: 'How are you?', sender: 'me' },
    ],
    // https://i.pravatar.cc/150?img=1
    members: [
        { name: 'Alice', avatar: '' },
        { name: 'Me', avatar: '' },
    ]
  },
  {
    id: 2,
    name: 'Bob',
    avatar: '',
    isGroup: false,
    messages: [
        { id: 1, text: 'Hi there!', sender: 'Bob' },
    ],
    members: [
        { name: 'Bob', avatar: '' },
        { name: 'Me', avatar: '' },
    ]
  },
  {
    id: 'group-1',
    name: 'Project Discussion',
    avatar: '',
    isGroup: true,
    messages: [
        { id: 1, text: 'Let\'s discuss the project timeline', sender: 'Charlie', tag: 'timeline' },
        { id: 2, text: 'Sure, I have some updates', sender: 'me', tag: 'updates' },
    ],
    members: [
      { name: 'Charlie', avatar: '' },
      { name: 'David', avatar: '' },
      { name: 'Me', avatar: '' },
    ],
  },
];

