const rounds = [
    {
        inventor: 'Tim Berners-Lee',
        video: {
            src: '/assets/videos/tim-berners-lee.mp4',
            title: 'Tim Berners-Lee',
            summary: 'The inventor of the World Wide Web.'
        },
        questions: [
            {
                id: 'tbl-1',
                text: 'What did Tim Berners-Lee invent?',
                options: ['The Internet', 'The World Wide Web', 'JavaScript', 'HTML'],
                correctIndex: 1,
                explanation: 'Tim Berners-Lee invented the World Wide Web in 1989.'
            },
            {
                id: 'tbl-2',
                text: 'What was the name of the first web browser?',
                options: ['Mosaic', 'Netscape Navigator', 'WorldWideWeb', 'Internet Explorer'],
                correctIndex: 2,
                explanation: 'The first web browser was called WorldWideWeb and was also created by Tim Berners-Lee.'
            }
        ]
    },
    {
        inventor: 'Ray Tomlinson',
        video: {
            src: '/assets/videos/ray-tomlinson.mp4',
            title: 'Ray Tomlinson',
            summary: 'The inventor of email.'
        },
        questions: [
            {
                id: 'rt-1',
                text: 'What is Ray Tomlinson known for?',
                options: ['Inventing the @ symbol in email addresses', 'Inventing the first computer mouse', 'Creating the first social media platform', 'Developing the first video game'],
                correctIndex: 0,
                explanation: 'Ray Tomlinson is credited with inventing the email system and choosing the @ symbol to separate the user name from the host name.'
            },
            {
                id: 'rt-2',
                text: 'In which decade was the first email sent?',
                options: ['1960s', '1970s', '1980s', '1990s'],
                correctIndex: 1,
                explanation: 'The first email was sent by Ray Tomlinson in 1971.'
            }
        ]
    },
    {
        inventor: 'Vitalik Buterin',
        video: {
            src: '/assets/videos/vitalik-buterin.mp4',
            title: 'Vitalik Buterin',
            summary: 'The co-founder of Ethereum.'
        },
        questions: [
            {
                id: 'vb-1',
                text: 'Vitalik Buterin is the co-founder of which blockchain platform?',
                options: ['Bitcoin', 'Ripple', 'Ethereum', 'Litecoin'],
                correctIndex: 2,
                explanation: 'Vitalik Buterin is one of the co-founders of Ethereum, a decentralized platform that runs smart contracts.'
            },
            {
                id: 'vb-2',
                text: 'What is the native cryptocurrency of the Ethereum platform?',
                options: ['BTC', 'XRP', 'ETH', 'LTC'],
                correctIndex: 2,
                explanation: 'The native cryptocurrency of the Ethereum platform is Ether (ETH).'
            }
        ]
    },
    {
        inventor: 'George W. Bush',
        video: {
            src: '/assets/videos/bush.mp4',
            title: 'George W. Bush',
            summary: 'A former US President.'
        },
        questions: [
            {
                id: 'gwb-1',
                text: 'George W. Bush was the...?',
                options: ['42nd US President', '43rd US President', '44th US President', '45th US President'],
                correctIndex: 1,
                explanation: 'George W. Bush was the 43rd President of the United States, serving from 2001 to 2009.'
            },
            {
                id: 'gwb-2',
                text: 'Which major event occurred during George W. Bush\'s presidency?',
                options: ['The fall of the Berlin Wall', 'The 9/11 terrorist attacks', 'The beginning of the Vietnam War', 'The signing of the Declaration of Independence'],
                correctIndex: 1,
                explanation: 'The September 11th terrorist attacks occurred on September 11, 2001, during George W. Bush\'s first term as president.'
            }
        ]
    }
];

const QUESTION_TIME_LIMIT_SECONDS = 20;

module.exports = { rounds, QUESTION_TIME_LIMIT_SECONDS };