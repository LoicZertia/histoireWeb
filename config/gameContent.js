const rounds = [
    {
        inventor: 'Tim Berners-Lee',
        video: {
            src: '/assets/videos/tim-berners-lee.mp4',
            title: 'Tim Berners-Lee',
            summary: 'L\'inventeur du World Wide Web.'
        },
        questions: [
            {
                id: 'tbl-1',
                text: 'En quelle année Tim Berners-Lee a-t-il inventé le World Wide Web ?',
                options: ['1985', '1989', '1991', '1993'],
                correctIndex: 1,
                explanation: 'Tim Berners-Lee a inventé le World Wide Web en 1989 au CERN, en Suisse.'
            },
            {
                id: 'tbl-2',
                text: 'Quelle était la fonction principale du premier navigateur web "WorldWideWeb" ?',
                options: ['Seulement lire des pages', 'Lire ET éditer des pages', 'Envoyer des emails', 'Jouer des vidéos'],
                correctIndex: 1,
                explanation: 'Contrairement aux navigateurs modernes, le premier navigateur permettait à la fois de lire et d\'éditer des pages web !'
            },
            {
                id: 'tbl-3',
                text: 'Quelle technologie Tim Berners-Lee n\'a-t-il PAS inventée ?',
                options: ['HTTP', 'HTML', 'URL', 'JavaScript'],
                correctIndex: 3,
                explanation: 'JavaScript a été créé par Brendan Eich en 1995, tandis que Tim Berners-Lee a inventé HTTP, HTML et le système d\'URL.'
            }
        ]
    },
    {
        inventor: 'Ray Tomlinson',
        video: {
            src: '/assets/videos/ray-tomlinson.mp4',
            title: 'Ray Tomlinson',
            summary: 'L\'inventeur de l\'email.'
        },
        questions: [
            {
                id: 'rt-1',
                text: 'Pourquoi Ray Tomlinson a-t-il choisi le symbole @ pour les adresses email ?',
                options: ['C\'était joli', 'Il n\'était pas utilisé dans les noms', 'C\'était à la mode', 'Par hasard'],
                correctIndex: 1,
                explanation: 'Ray Tomlinson a choisi @ car ce symbole n\'apparaissait jamais dans les noms de personnes, évitant ainsi toute confusion.'
            },
            {
                id: 'rt-2',
                text: 'Quel était le contenu du premier email envoyé par Ray Tomlinson ?',
                options: ['Hello World', 'Test', 'QWERTYUIOP (touches du clavier)', 'Il ne s\'en souvient pas'],
                correctIndex: 3,
                explanation: 'Ray Tomlinson lui-même a déclaré avoir oublié le contenu exact du premier email, probablement quelque chose comme "QWERTYUIOP".'
            },
            {
                id: 'rt-3',
                text: 'Sur quel réseau le premier email a-t-il été envoyé ?',
                options: ['Internet', 'ARPANET', 'Ethernet', 'WiFi'],
                correctIndex: 1,
                explanation: 'Le premier email a été envoyé sur ARPANET en 1971, l\'ancêtre de l\'Internet moderne.'
            }
        ]
    },
    {
        inventor: 'Vitalik Buterin',
        video: {
            src: '/assets/videos/vitalik-buterin.mp4',
            title: 'Vitalik Buterin',
            summary: 'Le co-fondateur d\'Ethereum.'
        },
        questions: [
            {
                id: 'vb-1',
                text: 'Quel âge avait Vitalik Buterin lorsqu\'il a co-fondé Ethereum ?',
                options: ['17 ans', '19 ans', '21 ans', '25 ans'],
                correctIndex: 1,
                explanation: 'Vitalik Buterin n\'avait que 19 ans en 2013 lorsqu\'il a proposé Ethereum. Un vrai prodige !'
            },
            {
                id: 'vb-2',
                text: 'Quelle est la principale différence entre Bitcoin et Ethereum ?',
                options: ['Bitcoin est plus rapide', 'Ethereum permet les smart contracts', 'Bitcoin a plus de cryptomonnaie', 'Il n\'y a aucune différence'],
                correctIndex: 1,
                explanation: 'Contrairement à Bitcoin qui est principalement une monnaie, Ethereum est une plateforme permettant d\'exécuter des smart contracts (contrats intelligents).'
            },
            {
                id: 'vb-3',
                text: 'Quel problème Vitalik voulait-il résoudre en créant Ethereum ?',
                options: ['Rendre Bitcoin plus rapide', 'Créer une plateforme programmable décentralisée', 'Remplacer les banques', 'Miner plus de crypto'],
                correctIndex: 1,
                explanation: 'Vitalik a créé Ethereum pour permettre aux développeurs de créer des applications décentralisées, pas seulement des transactions financières.'
            }
        ]
    },
    {
        inventor: 'George W. Bush',
        video: {
            src: '/assets/videos/bush.mp4',
            title: 'George W. Bush',
            summary: 'Ancien président des États-Unis.'
        },
        questions: [
            {
                id: 'gwb-1',
                text: 'Quel lien George W. Bush a-t-il avec l\'histoire du web ?',
                options: ['Il a inventé Google', 'Il est devenu un mème Internet', 'Il a créé Facebook', 'Aucun lien'],
                correctIndex: 1,
                explanation: 'George W. Bush est devenu célèbre sur Internet pour ses gaffes et maladresses, donnant naissance à de nombreux mèmes.'
            },
            {
                id: 'gwb-2',
                text: 'Quelle célèbre phrase maladroite Bush a-t-il prononcée ?',
                options: ['"Fool me once..."', '"I have a dream"', '"Yes we can"', '"Make America great"'],
                correctIndex: 0,
                explanation: 'Sa célèbre gaffe : "Fool me once, shame on... shame on you. Fool me... you can\'t get fooled again!" est devenue virale.'
            },
            {
                id: 'gwb-3',
                text: 'Pendant quel mandat de Bush les réseaux sociaux ont-ils explosé ?',
                options: ['Avant sa présidence', 'Premier mandat (2001-2005)', 'Second mandat (2005-2009)', 'Après sa présidence'],
                correctIndex: 2,
                explanation: 'Facebook (2004), YouTube (2005) et Twitter (2006) ont tous été lancés pendant la présidence de Bush, contribuant à la viralité de ses gaffes.'
            }
        ]
    }
];

const QUESTION_TIME_LIMIT_SECONDS = 20;

module.exports = { rounds, QUESTION_TIME_LIMIT_SECONDS };