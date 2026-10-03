import json
import os
import sys

STATE_PATH = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'mock-strapi-state.json')

ARTICLE_TITLES = [
    'The Broken Promise of Traditional Savings',
    'A River of Liquidity for Everyday People',
    'One Hundred Thousand Hands, One Purpose',
    'The 50 Birr That Changes Everything',
    'Fairness You Can Verify',
    'Dignity, Delivered Daily',
    'Join the Movement',
]


def article(order):
    return {
        'documentId': f'art-{order}',
        'order': order,
        'title': ARTICLE_TITLES[order - 1],
        'subtitle': f'Subtitle for article {order}',
        'slug': f'mock-article-{order}',
        'nav_label': f'Mock {order}',
        'category': f'Chapter {order}',
        'highlight': f'Highlight quote for article {order}.',
        'body': f'First paragraph of article {order}.\n\nSecond paragraph of article {order}.',
        'image': None,
    }


def slide(number):
    return {
        'documentId': f'slide-{number}',
        'sort_order': number,
        'eyebrow': f'Mock eyebrow {number}',
        'heading': f'Mock Heading {number}',
        'accent': 'Everyday Ethiopia',
        'body': f'Mock body copy for slide {number}.',
        'image': f'/images/image{number}.jpg',
        'stat_value': '5M',
        'stat_label': 'Birr Daily Liquidity',
        'cta1_label': 'Join the Movement',
        'cta1_href': '#article-7',
        'cta2_label': 'Discover the Model',
        'cta2_href': '#article-2',
    }


def build(article_count=7, slide_count=3, rename_slide=None):
    articles_data = [article(i) for i in range(1, article_count + 1)]
    slides_data = [slide(i) for i in range(1, slide_count + 1)]
    if rename_slide:
        for item in slides_data:
            if item['documentId'] == rename_slide:
                item['heading'] = 'A Fresh Start for Modern Ethiopia'
    return {
        'articles': {'data': articles_data, 'meta': {'pagination': {'total': article_count}}},
        'heroSlides': {'data': slides_data, 'meta': {'pagination': {'total': slide_count}}},
        'settings': {'data': {'documentId': 'set-1', 'site_name': 'The Merkato Fund'}},
    }


def save(state):
    with open(STATE_PATH, 'w', encoding='utf-8') as handle:
        json.dump(state, handle, indent=1)


if __name__ == '__main__':
    command = sys.argv[1] if len(sys.argv) > 1 else 'full'
    if command == 'full':
        save(build())
    elif command == 'rename-slide1':
        save(build(rename_slide='slide-1'))
    elif command == 'delete-article7-slide3':
        save(build(article_count=6, slide_count=2))
    elif command == 'empty':
        state = build()
        state['articles'] = {'data': [], 'meta': {'pagination': {'total': 0}}}
        state['heroSlides'] = {'data': [], 'meta': {'pagination': {'total': 0}}}
        save(state)
    else:
        raise SystemExit(f'unknown command: {command}')
    print(f'state -> {command}')
