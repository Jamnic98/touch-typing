from random import shuffle, choice

from fastapi import APIRouter

text_router = APIRouter(prefix='/text')


@text_router.post('/generate-practice-text')
async def generate_practice_text():
    input_texts = [
        'the quick brown fox jumps over the lazy dog the quick brown fox jumps over the lazy dog',
        'waltz bad nymph for quick jigs vex waltz bad nymph for quick jigs vex',
        'the five boxing wizards jump quickly the five boxing wizards jump quickly',
        'jackdaws love my big sphinx of quartz jackdaws love my big sphinx of quartz',
        'how vexingly quick daft zebras jump how vexingly quick daft zebras jump'
    ]


    random_text = choice(input_texts)
    words = random_text.split(' ')
    shuffle(words)
    output_text = ' '.join(words)
    return {'text': output_text}
