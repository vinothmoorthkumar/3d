// Sample announcements and news for demo mode (see lib/demo.ts). These are NOT real notices or
// news stories: every item is labelled as sample data, headlines say they are placeholders, and
// news items do not link anywhere. Announcement buttons only point to official careers.un.org pages.
import { OFFICIAL } from './content';
import type { Announcement, Lang, NewsItem } from '../lib/unApi';

const home = (lang: Lang) => `${OFFICIAL}/home?language=${lang}`;
const jobs = (lang: Lang) => `${OFFICIAL}/jobopening?language=${lang}`;

export function sampleAnnouncements(lang: Lang): Announcement[] {
  const fr = lang === 'fr';
  return [
    {
      id: 'sample-announcement-1',
      sample: true,
      blocks: [
        { type: 'heading', text: fr ? 'Exemple d’annonce – maintenance du site' : 'Sample announcement – site maintenance' },
        {
          type: 'text',
          parts: [
            {
              text: fr
                ? 'Texte d’exemple montrant comment une annonce apparaît sur cette page. Il ne s’agit pas d’un avis officiel de l’Organisation des Nations Unies.'
                : 'Placeholder text showing how an announcement appears on this page. It is not an official notice from the United Nations.',
            },
          ],
        },
        { type: 'text', parts: [{ text: fr ? 'Visiter careers.un.org' : 'Visit careers.un.org', href: home(lang) }] },
      ],
    },
    {
      id: 'sample-announcement-2',
      sample: true,
      blocks: [
        { type: 'heading', text: fr ? 'Exemple d’annonce – nouveaux postes' : 'Sample announcement – new job openings' },
        {
          type: 'text',
          parts: [
            {
              text: fr
                ? 'Texte d’exemple. Pour connaître les possibilités actuelles, consultez les postes vacants sur le site officiel.'
                : 'Placeholder text. For current opportunities, search the job openings on the official site.',
            },
          ],
        },
        { type: 'text', parts: [{ text: fr ? 'Rechercher des postes' : 'Search jobs', href: jobs(lang) }] },
      ],
    },
  ];
}

export function sampleNews(lang: Lang): NewsItem[] {
  const fr = lang === 'fr';
  const titles = fr
    ? [
        'Exemple de titre – un article d’actualité apparaîtrait ici',
        'Exemple de titre – contenu fictif pour la démonstration',
        'Exemple de titre – aucune actualité réelle n’est affichée',
      ]
    : [
        'Sample headline – a news story would appear here',
        'Sample headline – placeholder content for this demo',
        'Sample headline – no real news is shown',
      ];
  return titles.map((title, i) => ({ id: `sample-news-${i + 1}`, title, sample: true }));
}
