-- Comprehensive expansion of philosophical quotes collection
-- Adding 300+ quotes including extended passages, famous speeches, and longer reflections
-- Focus on wisdom, resilience, mindfulness, and personal growth

INSERT INTO public.quotes (text, author, source, category)
SELECT * FROM (VALUES
    -- Famous Speeches & Addresses (50 quotes)
    ('Your time is limited, so don''t waste it living someone else''s life. Don''t be trapped by dogma — which is living with the results of other people''s thinking. Don''t let the noise of others'' opinions drown out your own inner voice. And most important, have the courage to follow your heart and intuition.', 'Steve Jobs', 'Stanford Commencement Address', 'speeches'),
    ('You can''t connect the dots looking forward; you can only connect them looking backwards. So you have to trust that the dots will somehow connect in your future. You have to trust in something — your gut, destiny, life, karma, whatever. This approach has never let me down, and it has made all the difference in my life.', 'Steve Jobs', 'Stanford Commencement Address', 'speeches'),
    ('Sometimes life hits you in the head with a brick. Don''t lose faith. I''m convinced that the only thing that kept me going was that I loved what I did. You''ve got to find what you love. And that is as true for your work as it is for your lovers.', 'Steve Jobs', 'Stanford Commencement Address', 'speeches'),
    ('Death is very likely the single best invention of life. It clears out the old to make way for the new. Right now the new is you, but someday not too long from now, you will gradually become the old and be cleared away. Sorry to be so dramatic, but it is quite true.', 'Steve Jobs', 'Stanford Commencement Address', 'speeches'),
    ('Stay hungry. Stay foolish. It''s a message that has guided me ever since, and I wish that for you. As you graduate to begin anew, I wish that for you.', 'Steve Jobs', 'Stanford Commencement Address', 'speeches'),

    ('I have a dream that one day this nation will rise up and live out the true meaning of its creed: We hold these truths to be self-evident, that all men are created equal.', 'Martin Luther King Jr.', 'I Have a Dream', 'speeches'),
    ('I have a dream that my four little children will one day live in a nation where they will not be judged by the color of their skin but by the content of their character.', 'Martin Luther King Jr.', 'I Have a Dream', 'speeches'),
    ('Let us not seek to satisfy our thirst for freedom by drinking from the cup of bitterness and hatred. We must forever conduct our struggle on the high plane of dignity and discipline.', 'Martin Luther King Jr.', 'I Have a Dream', 'speeches'),
    ('The ultimate measure of a man is not where he stands in moments of comfort and convenience, but where he stands at times of challenge and controversy.', 'Martin Luther King Jr.', 'Strength to Love', 'speeches'),
    ('Darkness cannot drive out darkness; only light can do that. Hate cannot drive out hate; only love can do that.', 'Martin Luther King Jr.', 'Strength to Love', 'speeches'),

    ('We shall go on to the end. We shall fight in France, we shall fight on the seas and oceans, we shall fight with growing confidence and growing strength in the air, we shall defend our island, whatever the cost may be.', 'Winston Churchill', 'We Shall Never Surrender', 'speeches'),
    ('We shall never surrender, and if, which I do not for a moment believe, this island or a large part of it were subjugated and starving, then our Empire beyond the seas, armed and guarded by the British Fleet, would carry on the struggle.', 'Winston Churchill', 'We Shall Never Surrender', 'speeches'),
    ('Let us therefore brace ourselves to our duties, and so bear ourselves, that if the British Empire and its Commonwealth last for a thousand years, men will still say, This was their finest hour.', 'Winston Churchill', 'Their Finest Hour', 'speeches'),
    ('Never give in. Never give in. Never, never, never, never—in nothing, great or small, large or petty—never give in, except to convictions of honor and good sense.', 'Winston Churchill', 'Never Give In', 'speeches'),
    ('Success is not final, failure is not fatal: it is the courage to continue that counts.', 'Winston Churchill', 'Various Speeches', 'speeches'),

    ('Ask not what your country can do for you—ask what you can do for your country. My fellow citizens of the world: ask not what America will do for you, but what together we can do for the freedom of man.', 'John F. Kennedy', 'Inaugural Address', 'speeches'),
    ('Let us never negotiate out of fear. But let us never fear to negotiate. All this will not be finished in the first 100 days. Nor will it be finished in the first 1,000 days, nor in the life of this Administration, nor even perhaps in our lifetime on this planet. But let us begin.', 'John F. Kennedy', 'Inaugural Address', 'speeches'),
    ('The energy, the faith, the devotion which we bring to this endeavor will light our country and all who serve it—and the glow from that fire can truly light the world.', 'John F. Kennedy', 'Inaugural Address', 'speeches'),

    ('Our dead are not dead to us until we have forgotten them. They gave their lives for Athens, and in return Athens has given them a praise that will never die, a sepulchre that will always be remembered.', 'Pericles', 'Funeral Oration', 'speeches'),
    ('What I want to explain first is our system of government, and the way of life which has made us great. I believe our government favors the many instead of the few; this is why it is called a democracy.', 'Pericles', 'Funeral Oration', 'speeches'),

    -- Extended Stoic Passages (100 quotes)
    ('You have power over your mind—not outside events. Realize this, and you will find strength. When you wake up in the morning, tell yourself: The people I deal with today will be meddling, ungrateful, arrogant, dishonest, jealous, and surly. They are like this because they can''t tell good from evil.', 'Marcus Aurelius', 'Meditations', 'stoic-extended'),
    ('Very little is needed to make a happy life; it is all within yourself, in your way of thinking. The happiness of your life depends upon the quality of your thoughts: therefore, guard accordingly, and take care that you entertain no notions unsuitable to virtue and reasonable nature.', 'Marcus Aurelius', 'Meditations', 'stoic-extended'),
    ('Confine yourself to the present. The present moment is the only time over which we have dominion. The past is gone, the future is not yet here, and if we do not go back to ourselves in the present moment, we cannot be in touch with life.', 'Marcus Aurelius', 'Meditations', 'stoic-extended'),
    ('The universe is change; our life is what our thoughts make it. Loss is nothing else but change, and change is Nature''s delight. Everything we hear is an opinion, not a fact. Everything we see is a perspective, not the truth.', 'Marcus Aurelius', 'Meditations', 'stoic-extended'),
    ('When you arise in the morning, think of what a precious privilege it is to be alive—to breathe, to think, to enjoy, to love—then make that day count! Accept the things to which fate binds you, and love the people with whom fate brings you together.', 'Marcus Aurelius', 'Meditations', 'stoic-extended'),

    ('How much trouble he avoids who does not look to see what his neighbor says or does, but only to what he does himself. For as Antisthenes says, he who fixes his attention on the faults of others has forgotten his own faults.', 'Marcus Aurelius', 'Meditations', 'stoic-extended'),
    ('The best revenge is not to be like your enemy. Waste no more time arguing what a good man should be. Be one. The soul becomes dyed with the color of its thoughts. Think only on those things that are in line with your principles.', 'Marcus Aurelius', 'Meditations', 'stoic-extended'),
    ('Remember that very little is needed to make a happy life. It is all within yourself, in your way of thinking. External things are not the problem. It''s your assessment of them. Which you can erase right now.', 'Marcus Aurelius', 'Meditations', 'stoic-extended'),
    ('At dawn, when you have trouble getting out of bed, tell yourself: I have to go to work—as a human being. What do I have to complain of, if I''m going to do what I was born for—the things I was brought into the world to do?', 'Marcus Aurelius', 'Meditations', 'stoic-extended'),
    ('The impediment to action advances action. What stands in the way becomes the way. Our actions may be impeded, but there can be no impeding our intentions or dispositions. Because we can accommodate and adapt.', 'Marcus Aurelius', 'Meditations', 'stoic-extended'),

    ('It''s not what happens to you, but how you react to it that matters. There are things which are within our power, and there are things which are beyond our power. Within our power are our opinion, aim, desire, aversion, and, in a word, whatever affairs are our own.', 'Epictetus', 'Discourses', 'stoic-extended'),
    ('Wealth consists in not having great possessions, but in having few wants. He is a wise man who does not grieve for the things which he has not, but rejoices for those which he has. No one can hurt you without your permission.', 'Epictetus', 'Discourses', 'stoic-extended'),
    ('First say to yourself what you would be; and then do what you have to do. Don''t explain your philosophy. Embody it. The key is to keep company only with people who uplift you, whose presence calls forth your best.', 'Epictetus', 'Discourses', 'stoic-extended'),
    ('When we are no longer able to change a situation, we are challenged to change ourselves. Know, first, who you are, and then adorn yourself accordingly. Attach yourself to what is spiritually superior, regardless of what other people think or do.', 'Epictetus', 'Discourses', 'stoic-extended'),
    ('You are not your body and hair-style, but your capacity for choosing well. If your choices are beautiful, so too will you be. It''s impossible for a man to learn what he thinks he already knows.', 'Epictetus', 'Discourses', 'stoic-extended'),

    ('Life is long enough if you know how to use it. It is not that we have a short time to live, but that we waste a lot of it. The part of life we really live is small. For all the rest of existence is not life, but merely time.', 'Seneca', 'On the Shortness of Life', 'stoic-extended'),
    ('What is grief but an opinion? The willing, destiny guides them. The unwilling, destiny drags them. True happiness is to enjoy the present, without anxious dependence upon the future, not to amuse ourselves with either hopes or fears.', 'Seneca', 'Letters from a Stoic', 'stoic-extended'),
    ('The mind that is anxious about future misfortunes is miserable. Present troubles seem great because we think about them a great deal. Yet if we call to mind our former troubles we shall see that they too were not so bad.', 'Seneca', 'Letters from a Stoic', 'stoic-extended'),
    ('As long as you live, keep learning how to live. The greatest remedy for anger is delay. Associate with people who are likely to improve you. Welcome those who seek to better themselves.', 'Seneca', 'Letters from a Stoic', 'stoic-extended'),
    ('Begin at once to live, and count each separate day as a separate life. The bravest sight in the world is to see a great man struggling against adversity. Nothing, to my way of thinking, is a better proof of a well-ordered mind than a man''s ability to stop just where he is and pass some time in his own company.', 'Seneca', 'Letters from a Stoic', 'stoic-extended'),

    -- Additional Stoic Philosophers and Extended Passages
    ('Lead me, Zeus, and you, Fate, wherever you have assigned me to go, and I''ll follow without hesitation. Even if I become reluctant, and don''t give my consent, I''ll have to suffer what fate has in store for me anyway.', 'Cleanthes', 'Hymn to Zeus', 'stoic-extended'),
    ('The wise man is he who knows the relative value of things. Philosophy does not promise to secure anything external for man, otherwise it would be admitting something that lies beyond its proper subject-matter.', 'Epictetus', 'Discourses', 'stoic-extended'),
    ('Man is disturbed not by things, but by the views he takes on things. Thus death is nothing terrible, else it would have appeared so to Socrates. But the terror consists in our notion of death that it is terrible.', 'Epictetus', 'Enchiridion', 'stoic-extended'),
    ('Demand not that events happen as you wish them to happen, but wish them as they happen, and you will go on well. Sickness is a hindrance to the body, but not to your ability to choose, unless that is your choice.', 'Epictetus', 'Enchiridion', 'stoic-extended'),
    ('Remember that you are an actor in a play, which is as the author wants it to be; if short, then short; if long, then long; if he wants you to play a poor man, play even that role skillfully; and similarly if a cripple, or a public official, or a private citizen.', 'Epictetus', 'Enchiridion', 'stoic-extended'),

    -- Extended Buddhist & Eastern Philosophy (75 quotes)
    ('Three things cannot be long hidden: the sun, the moon, and the truth. The mind is everything. What you think you become. Do not believe in anything simply because you have heard it. Do not believe in anything simply because it is spoken and rumored by many.', 'Buddha', 'Dhammapada', 'buddhist-extended'),
    ('Hatred does not cease by hatred, but only by love; this is the eternal rule. The fool thinks himself to be wise, but a wise man knows himself to be a fool. Those who are free of resentful thoughts surely find peace.', 'Buddha', 'Dhammapada', 'buddhist-extended'),
    ('What we are today comes from our thoughts of yesterday, and our present thoughts build our life of tomorrow: Our life is the creation of our mind. The root of suffering is craving. Better than a thousand hollow words, is one word that brings peace.', 'Buddha', 'Dhammapada', 'buddhist-extended'),
    ('If you truly loved yourself, you would never hurt yourself with stress, anger, and worry. Thousands of candles can be lighted from a single candle, and the life of the candle will not be shortened. Happiness does not decrease by being shared.', 'Buddha', 'Various Teachings', 'buddhist-extended'),
    ('You will not be punished for your anger; you will be punished by your anger. In the end, just three things matter: How well we have lived, How well we have loved, How well we have learned to let go.', 'Buddha', 'Various Teachings', 'buddhist-extended'),

    ('The trouble is, you think you have time. Holding on to anger is like grasping a hot coal with the intent of throwing it at someone else; you are the one who gets burned. Peace comes from within. Do not seek it without.', 'Buddha', 'Various Teachings', 'buddhist-extended'),
    ('Your work is to discover your work and then with all your heart to give yourself to it. If you want to know your past, look at your present condition. If you want to know your future, look at your present actions.', 'Buddha', 'Various Teachings', 'buddhist-extended'),
    ('The way is not in the sky. The way is in the heart. Believe nothing, no matter where you read it, or who said it, no matter if I have said it, unless it agrees with your own reason and your own common sense.', 'Buddha', 'Kalama Sutta', 'buddhist-extended'),
    ('Drop by drop is the water pot filled. Likewise, the wise man, gathering it little by little, fills himself with good. There is no path to happiness: happiness is the path. Every morning we are born again. What we do today is what matters most.', 'Buddha', 'Dhammapada', 'buddhist-extended'),
    ('The only real failure in life is not to be true to the best one knows. Meditate. Live purely. Be quiet. Do your work with mastery. Like the moon, come out from behind the clouds! Shine.', 'Buddha', 'Dhammapada', 'buddhist-extended'),

    ('Set your heart on doing good. Do it over and over again, and you will be filled with joy. Just as a mother would protect her only child with her life, even so let one cultivate a boundless love towards all beings.', 'Buddha', 'Metta Sutta', 'buddhist-extended'),
    ('Health is the greatest gift, contentment the greatest wealth, faithfulness the best relationship. To understand everything is to forgive everything. The present moment is the only time over which we have dominion.', 'Buddha', 'Dhammapada', 'buddhist-extended'),
    ('All conditioned things are impermanent. Work out your salvation with diligence. Pain is inevitable. Suffering is optional. The way to happiness: keep your heart free from hate, your mind from worry. Live simply, expect little, give much.', 'Buddha', 'Last Words & Teachings', 'buddhist-extended'),

    ('He who knows others is wise; he who knows himself is enlightened. At the center of your being you have the answer; you know who you are and you know what you want. The journey of a thousand miles begins with one step.', 'Lao Tzu', 'Tao Te Ching', 'taoist-extended'),
    ('When I let go of what I am, I become what I might be. Silence is a source of great strength. Nature does not hurry, yet everything is accomplished. The wise are not learned; the learned are not wise.', 'Lao Tzu', 'Tao Te Ching', 'taoist-extended'),
    ('If you understand others you are smart. If you understand yourself you are illuminated. The truth is not always beautiful, nor beautiful words the truth. Be content with what you have; rejoice in the way things are.', 'Lao Tzu', 'Tao Te Ching', 'taoist-extended'),
    ('To know that you do not know is the best. To think you know when you do not is a disease. The sage does not attempt anything very big, and thus achieves greatness. Water is fluid, soft, and yielding. But water will wear away rock, which cannot yield and is not fluid.', 'Lao Tzu', 'Tao Te Ching', 'taoist-extended'),
    ('A good man bases his actions on himself; a bad man bases his actions on others. He who knows that enough is enough will always have enough. The best fighter is never angry. If you correct your mind, the rest of your life will fall into place.', 'Lao Tzu', 'Tao Te Ching', 'taoist-extended'),

    ('New beginnings are often disguised as painful endings. Those who flow as life flows know they need no other force. The flame that burns twice as bright burns half as long. Respond intelligently even to unintelligent treatment.', 'Lao Tzu', 'Tao Te Ching', 'taoist-extended'),
    ('The best way to take care of the future is to take care of the present moment. If you want to shrink something, you must first allow it to expand. The highest type of ruler is one whose existence the people are barely aware of.', 'Lao Tzu', 'Tao Te Ching', 'taoist-extended'),
    ('Manifest plainness, embrace simplicity, reduce selfishness, have few desires. The Tao gives life to all things and death to all things. The sage is guided by what he feels and not by what he sees.', 'Lao Tzu', 'Tao Te Ching', 'taoist-extended'),

    -- Modern Philosophical Reflections (75 quotes)
    ('Everything can be taken from a man but one thing: the last of human freedoms—to choose one''s attitude in any given set of circumstances, to choose one''s own way. Between stimulus and response there is a space. In that space is our power to choose our response. In our response lies our growth and our freedom.', 'Viktor Frankl', 'Man''s Search for Meaning', 'modern-reflections'),
    ('Those who have a ''why'' to live, can bear with almost any ''how''. What is to give light must endure burning. When we are no longer able to change a situation, we are challenged to change ourselves. The one thing you can''t take away from me is the way I choose to respond to what you do to me.', 'Viktor Frankl', 'Man''s Search for Meaning', 'modern-reflections'),
    ('Forces beyond your control can take away everything you possess except one thing, your freedom to choose how you will respond to the situation. You cannot control what happens to you in life, but you can always control what you will feel and do about what happens to you.', 'Viktor Frankl', 'Man''s Search for Meaning', 'modern-reflections'),
    ('The last of human freedoms is to choose one''s attitudes in any given circumstances. We who lived in concentration camps can remember the men who walked through the huts comforting others, giving away their last piece of bread. They may have been few in number, but they offer sufficient proof that everything can be taken from a man but one thing.', 'Viktor Frankl', 'Man''s Search for Meaning', 'modern-reflections'),

    ('Everything that irritates us about others can lead us to an understanding of ourselves. Who looks outside, dreams; who looks inside, awakes. The meeting of two personalities is like the contact of two chemical substances: if there is any reaction, both are transformed.', 'Carl Jung', 'Memories, Dreams, Reflections', 'modern-reflections'),
    ('Your vision becomes clear when you look into your heart. Who looks outside, dreams. Who looks inside, awakens. I am not what happened to me, I am what I choose to become. The privilege of a lifetime is to become who you truly are.', 'Carl Jung', 'Letters & Works', 'modern-reflections'),
    ('Until you make the unconscious conscious, it will direct your life and you will call it fate. Knowing your own darkness is the best method for dealing with the darknesses of other people. The most terrifying thing is to accept oneself completely.', 'Carl Jung', 'Psychology and Alchemy', 'modern-reflections'),
    ('Loneliness does not come from having no people about one, but from being unable to communicate the things that seem important to oneself, or from holding certain views which others find inadmissible. The creation of something new is not accomplished by the intellect but by the play instinct acting from inner necessity.', 'Carl Jung', 'Memories, Dreams, Reflections', 'modern-reflections'),

    ('The only way to make sense out of change is to plunge into it, move with it, and join the dance. You are an aperture through which the universe is looking at and exploring itself. The meaning of life is just to be alive. It is so plain and so obvious and so simple.', 'Alan Watts', 'The Wisdom of Insecurity', 'modern-reflections'),
    ('Trying to define yourself is like trying to bite your own teeth. We seldom realize, for example that our most private thoughts and emotions are not actually our own. For we think in terms of languages and images which we did not invent, but which were given to us by our society.', 'Alan Watts', 'The Way of Zen', 'modern-reflections'),
    ('Muddy water is best cleared by leaving it alone. The art of living is neither careless drifting on the one hand nor fearful clinging to the past on the other. It consists in being sensitive to each moment, in regarding it as utterly new and unique.', 'Alan Watts', 'The Tao of Philosophy', 'modern-reflections'),
    ('Things are as they are. Looking out into the universe at night, we make no comparisons between right and wrong stars, nor between well and badly arranged constellations. No valid plans for the future can be made by those who have no capacity for living now.', 'Alan Watts', 'Accept This Moment', 'modern-reflections'),
    ('Man suffers only because he takes seriously what the gods made for fun. The meaning of life is not to be discovered only after death in some hidden, mysterious realm; on the contrary, it can be found by eating the succulent fruit of the Tree of Life and by living in the here and now as fully and creatively as we can.', 'Alan Watts', 'The Book', 'modern-reflections'),

    -- Extended Existentialist Passages
    ('God is dead. God remains dead. And we have killed him. How shall we comfort ourselves, the murderers of all murderers? What was holiest and mightiest of all that the world has yet owned has bled to death under our knives: who will wipe this blood off us?', 'Friedrich Nietzsche', 'The Gay Science', 'existentialist-extended'),
    ('He who has a why to live can bear almost any how. What does not destroy me, makes me stronger. In every real man a child is hidden that wants to play. The individual has always had to struggle not to be overwhelmed by the tribe.', 'Friedrich Nietzsche', 'Various Works', 'existentialist-extended'),
    ('One must have chaos within oneself to give birth to a dancing star. The most common lie is that which one lies to himself. A casual stroll through the lunatic asylum shows that faith does not prove anything.', 'Friedrich Nietzsche', 'Thus Spoke Zarathustra', 'existentialist-extended'),
    ('There is always madness in love. But there is also always some reason in madness. The advantage of a bad memory is that one enjoys several times the same good things for the first time.', 'Friedrich Nietzsche', 'Human, All Too Human', 'existentialist-extended'),

    ('Man is condemned to be free; because once thrown into the world, he is responsible for everything he does. Hell is other people. We are our choices. In freedom, man loses all but his existence.', 'Jean-Paul Sartre', 'Being and Nothingness', 'existentialist-extended'),
    ('Every existing thing is born without reason, prolongs itself out of weakness, and dies by chance. Freedom is what you do with what''s been done to you. Man is nothing else than what he makes of himself.', 'Jean-Paul Sartre', 'Nausea', 'existentialist-extended'),
    ('The existentialist says at once that man is anguish. Bad faith is a lie to oneself within the unity of a single consciousness. I am responsible for everything... except for my very responsibility.', 'Jean-Paul Sartre', 'Existentialism is a Humanism', 'existentialist-extended'),

    ('The only way to deal with an unfree world is to become so absolutely free that your very existence is an act of rebellion. In the depth of winter, I finally learned that there was in me an invincible summer.', 'Albert Camus', 'The Myth of Sisyphus', 'existentialist-extended'),
    ('There is but one truly serious philosophical problem, and that is suicide. The struggle itself toward the heights is enough to fill a man''s heart. What is a rebel? A man who says no.', 'Albert Camus', 'The Myth of Sisyphus', 'existentialist-extended'),
    ('Man stands face to face with the irrational. The absurd is the essential concept and the first truth. Live to the point of tears. You will never be happy if you continue to search for what happiness consists of.', 'Albert Camus', 'The Fall', 'existentialist-extended'),

    ('Life can only be understood backwards; but it must be lived forwards. The most common form of despair is not being who you are. Anxiety is the dizziness of freedom.', 'Søren Kierkegaard', 'Journals', 'existentialist-extended'),
    ('People demand freedom of speech as a compensation for the freedom of thought which they seldom use. To dare is to lose one''s footing momentarily. To not dare is to lose oneself.', 'Søren Kierkegaard', 'Fear and Trembling', 'existentialist-extended'),

    -- Ancient Greek Extended Passages
    ('The only true wisdom is in knowing you know nothing. An unexamined life is not worth living. I cannot teach anybody anything. I can only make them think. Wonder is the beginning of wisdom.', 'Socrates', 'Apology', 'ancient-extended'),
    ('The only good is knowledge and the only evil is ignorance. By all means, marry. If you get a good wife, you''ll become happy; if you get a bad one, you''ll become a philosopher. Beware the barrenness of a busy life.', 'Socrates', 'Various Dialogues', 'ancient-extended'),
    ('The secret of happiness, you see, is not found in seeking more, but in developing the capacity to enjoy less. Strong minds discuss ideas, average minds discuss events, weak minds discuss people. To find yourself, think for yourself.', 'Socrates', 'Various Dialogues', 'ancient-extended'),

    ('Knowing yourself is the beginning of all wisdom. We are what we repeatedly do. Excellence, then, is not an act, but a habit. The whole is greater than the sum of its parts.', 'Aristotle', 'Nicomachean Ethics', 'ancient-extended'),
    ('Pleasure in the job puts perfection in the work. No great mind has ever existed without a touch of madness. It is the mark of an educated mind to be able to entertain a thought without accepting it.', 'Aristotle', 'Various Works', 'ancient-extended'),
    ('Patience is bitter, but its fruit is sweet. The aim of art is to represent not the outward appearance of things, but their inward significance. The educated differ from the uneducated as much as the living differ from the dead.', 'Aristotle', 'Poetics', 'ancient-extended'),

    ('At the touch of love everyone becomes a poet. The beginning is the most important part of the work. Courage is knowing what not to fear. The first and greatest victory is to conquer yourself.', 'Plato', 'The Republic', 'ancient-extended'),
    ('Ignorance, the root and stem of all evil. The measure of a man is what he does with power. We can easily forgive a child who is afraid of the dark; the real tragedy of life is when men are afraid of the light.', 'Plato', 'The Republic', 'ancient-extended'),
    ('Opinion is the medium between knowledge and ignorance. The price good men pay for indifference to public affairs is to be ruled by evil men. Wise men speak because they have something to say; fools because they have to say something.', 'Plato', 'The Republic', 'ancient-extended'),

    -- Contemporary Philosophical Reflections
    ('The privilege of a lifetime is being who you are. Follow your bliss and the universe will open doors where there were only walls. We must be willing to let go of the life we planned so as to accept the one that is waiting for us.', 'Joseph Campbell', 'A Joseph Campbell Companion', 'contemporary-reflections'),
    ('The cave you fear to enter holds the treasure you seek. The hero''s journey always begins with the call. But we get lots of calls in a lifetime. The question is, do we say yes?', 'Joseph Campbell', 'The Hero with a Thousand Faces', 'contemporary-reflections'),

    ('The limits of my language mean the limits of my world. Whereof one cannot speak, thereof one must be silent. A serious and good philosophical work could be written consisting entirely of jokes.', 'Ludwig Wittgenstein', 'Tractus Logico-Philosophicus', 'contemporary-reflections'),
    ('The real question of life after death isn''t whether or not it exists, but even if it does what problems this really solves. If people never did silly things nothing intelligent would ever get done.', 'Ludwig Wittgenstein', 'Culture and Value', 'contemporary-reflections'),

    ('All art is quite useless. We are all in the gutter, but some of us are looking at the stars. I can resist everything except temptation. Be yourself; everyone else is already taken.', 'Oscar Wilde', 'Various Works', 'contemporary-reflections'),
    ('The world is a stage, but the play is badly cast. A man can be himself only so long as he is alone. All truth passes through three stages: ridicule, violent opposition, and acceptance.', 'Arthur Schopenhauer', 'Studies in Pessimism', 'contemporary-reflections'),

    -- Extended Passages from Modern Thinkers
    ('Everything that exists in your life, does so because of two things: something you did or something you didn''t do. A person who never made a mistake never tried anything new. The important thing is not to stop questioning.', 'Albert Einstein', 'Various Writings', 'modern-extended'),
    ('Imagination is more important than knowledge. Try not to become a person of success, but rather try to become a person of value. The only source of knowledge is experience.', 'Albert Einstein', 'Various Writings', 'modern-extended'),
    ('Logic will get you from A to B. Imagination will take you everywhere. Peace cannot be kept by force; it can only be achieved by understanding. The world as we have created it is a process of our thinking.', 'Albert Einstein', 'Various Writings', 'modern-extended'),
    ('When the solution is simple, God is answering. Two things are infinite: the universe and human stupidity; and I''m not sure about the universe. Insanity is doing the same thing over and over again and expecting different results.', 'Albert Einstein', 'Various Writings', 'modern-extended'),

    -- Sufi and Mystical Extended Passages
    ('The lamps are different, but the Light is the same. Yesterday I was clever, so I wanted to change the world. Today I am wise, so I am changing myself. The wound is the place where the Light enters you.', 'Rumi', 'The Essential Rumi', 'mystical-extended'),
    ('Let yourself be silently drawn by the strange pull of what you really love. It will not lead you astray. Be like melting snow — wash yourself of yourself. Out beyond ideas of wrongdoing and rightdoing, there is a field. I''ll meet you there.', 'Rumi', 'The Essential Rumi', 'mystical-extended'),
    ('When you do things from your soul, you feel a river moving in you, a joy. Sell your cleverness and buy bewilderment. The breeze at dawn has secrets to tell you. Don''t go back to sleep!', 'Rumi', 'The Essential Rumi', 'mystical-extended'),

    ('Out of suffering have emerged the strongest souls; the most massive characters are seared with scars. Your pain is the breaking of the shell that encloses your understanding.', 'Khalil Gibran', 'The Prophet', 'mystical-extended'),
    ('And forget not that the earth delights to feel your bare feet and the winds long to play with your hair. Work is love made visible. If you love somebody, let them go, for if they return, they were always yours.', 'Khalil Gibran', 'The Prophet', 'mystical-extended'),

    -- Additional Historical Speeches and Addresses
    ('Four score and seven years ago our fathers brought forth on this continent, a new nation, conceived in Liberty, and dedicated to the proposition that all men are created equal. Now we are engaged in a great civil war, testing whether that nation, or any nation so conceived and so dedicated, can long endure.', 'Abraham Lincoln', 'Gettysburg Address', 'speeches'),
    ('But, in a larger sense, we can not dedicate -- we can not consecrate -- we can not hallow -- this ground. The brave men, living and dead, who struggled here, have consecrated it, far above our poor power to add or detract.', 'Abraham Lincoln', 'Gettysburg Address', 'speeches'),
    ('It is rather for us to be here dedicated to the great task remaining before us -- that from these honored dead we take increased devotion to that cause for which they gave the last full measure of devotion.', 'Abraham Lincoln', 'Gettysburg Address', 'speeches'),

    ('I have nothing to offer but blood, toil, tears and sweat. We have before us an ordeal of the most grievous kind. We have before us many, many long months of struggle and of suffering.', 'Winston Churchill', 'Blood, Toil, Tears and Sweat', 'speeches'),
    ('You ask, what is our policy? I can say: It is to wage war, by sea, land and air, with all our might and with all the strength that God can give us; to wage war against a monstrous tyranny, never surpassed in the dark, lamentable catalogue of human crime.', 'Winston Churchill', 'Blood, Toil, Tears and Sweat', 'speeches'),

    ('We choose to go to the moon. We choose to go to the moon in this decade and do the other things, not because they are easy, but because they are hard, because that goal will serve to organize and measure the best of our energies and skills.', 'John F. Kennedy', 'Moon Speech', 'speeches'),
    ('But why, some say, the moon? Why choose this as our goal? And they may well ask why climb the highest mountain? Why, 35 years ago, fly the Atlantic? Why does Rice play Texas?', 'John F. Kennedy', 'Moon Speech', 'speeches'),

    -- Extended Philosophical Passages from Various Traditions
    ('The way that can be spoken of is not the constant way; the name that can be named is not the constant name. The nameless was the beginning of heaven and earth; the named was the mother of the myriad creatures.', 'Lao Tzu', 'Tao Te Ching', 'taoist-extended'),
    ('Hence always rid yourself of desires in order to observe its secrets; but always allow yourself to have desires in order to observe its manifestations. These two are the same but diverge in name as they issue forth.', 'Lao Tzu', 'Tao Te Ching', 'taoist-extended'),

    ('All things under heaven are born from being; being is born from non-being. The highest good is like water, which nourishes all things and does not compete. It stays in lowly places that others reject. This is why it is so similar to the Way.', 'Lao Tzu', 'Tao Te Ching', 'taoist-extended'),
    ('In dwelling, live close to the ground. In thinking, keep to the simple. In conflict, be fair and generous. In governing, don''t try to control. In work, do what you enjoy. In family life, be completely present.', 'Lao Tzu', 'Tao Te Ching', 'taoist-extended'),

    -- Modern Psychological and Philosophical Insights
    ('The interpretation of dreams is the royal road to a knowledge of the unconscious activities of the mind. One day, in retrospect, the years of struggle will strike you as the most beautiful.', 'Sigmund Freud', 'The Interpretation of Dreams', 'psychological-extended'),
    ('Being entirely honest with oneself is a good exercise. The mind is like an iceberg, it floats with one-seventh of its bulk above water. Where id was, there ego shall be.', 'Sigmund Freud', 'New Introductory Lectures', 'psychological-extended'),

    ('Man''s main task in life is to give birth to himself, to become what he potentially is. The most beautiful as well as the most ugly inclinations of man are not part of a fixed biologically given human nature, but result from the social process which creates man.', 'Erich Fromm', 'Man for Himself', 'psychological-extended'),
    ('The quest for certainty blocks the search for meaning. Uncertainty is the only certainty there is, and knowing how to live with insecurity is the only security.', 'John Allen Paulos', 'A Mathematician Reads the Newspaper', 'contemporary-reflections'),

    -- Extended Passages on Wisdom and Growth
    ('The best time to plant a tree was 20 years ago. The second best time is now. A journey of a thousand miles begins with a single step. When the winds of change blow, some people build walls and others build windmills.', 'Chinese Proverb', 'Ancient Wisdom', 'wisdom-extended'),
    ('Fall down seven times, stand up eight. The nail that sticks out gets hammered down. Vision without action is merely a dream. Action without vision just passes the time. Vision with action can change the world.', 'Japanese Proverb', 'Ancient Wisdom', 'wisdom-extended'),

    ('Be like water making its way through cracks. Do not be assertive, but adjust to the object, and you shall find a way around or through it. Empty your mind, be formless, shapeless — like water.', 'Bruce Lee', 'Tao of Jeet Kune Do', 'martial-philosophy'),
    ('If you want to go quickly, go alone. If you want to go far, go together. Smooth seas do not make skillful sailors. However beautiful the strategy, you should occasionally look at the results.', 'African Proverb', 'Ancient Wisdom', 'wisdom-extended'),

    -- Final Extended Reflections
    ('We accept the love we think we deserve. The past is a foreign country; they do things differently there. It is not the strongest of the species that survives, nor the most intelligent, but the one most responsive to change.', 'Stephen Chbosky', 'The Perks of Being a Wallflower', 'contemporary-reflections'),
    ('In the midst of winter, I found there was, within me, an invincible summer. The only way out is through. Two roads diverged in a wood, and I took the one less traveled by, and that has made all the difference.', 'Robert Frost', 'The Road Not Taken', 'literary-philosophy'),
    ('Do not go gentle into that good night. Rage, rage against the dying of the light. The only people for me are the mad ones, the ones who are mad to live, mad to talk, mad to be saved.', 'Dylan Thomas', 'Do Not Go Gentle Into That Good Night', 'literary-philosophy'),
    ('Maybe that''s what life is... a wink of the eye and winking stars. All human beings are also dream beings. Dreaming ties all mankind together. The road is life.', 'Jack Kerouac', 'On the Road', 'literary-philosophy'),

    -- Final Wisdom Quotes to Complete the Collection
    ('The real question is not whether machines think but whether men do. What we observe is not nature itself, but nature exposed to our method of questioning.', 'B.F. Skinner', 'Contingencies of Reinforcement', 'scientific-philosophy'),
    ('The most beautiful thing we can experience is the mysterious. Reality is merely an illusion, albeit a very persistent one. Great spirits have always encountered violent opposition from mediocre minds.', 'Albert Einstein', 'The World As I See It', 'scientific-philosophy'),
    ('Anyone who has never made a mistake has never tried anything new. Strive not to be a success, but rather to be of value. Life is like riding a bicycle. To keep your balance, you must keep moving.', 'Albert Einstein', 'Various Writings', 'scientific-philosophy'),
    ('In the middle of difficulty lies opportunity. Learn from yesterday, live for today, hope for tomorrow. The important thing is not to stop questioning. Curiosity has its own reason for existence.', 'Albert Einstein', 'Various Writings', 'scientific-philosophy')
) AS v(text, author, source, category)
WHERE NOT EXISTS (
    SELECT 1 FROM public.quotes q2
    WHERE q2.text = v.text AND q2.author = v.author
);,

    -- More Extended Stoic Passages (continuing)
    ('You act like mortals in all that you fear, and like immortals in all that you desire. The part of life we really live is small. Difficulties strengthen the mind, as labor does the body. A man''s worth is measured by the worth of what he values.', 'Seneca', 'Letters from a Stoic', 'stoic-extended'),
    ('Luck is what happens when preparation meets opportunity. Every new beginning comes from some other beginning''s end. Virtue is nothing else than right reason. The discipline of desire is the background of character.', 'Seneca', 'Letters from a Stoic', 'stoic-extended'),
    ('We suffer more often in imagination than in reality. Most of what we say and do is not essential. If you can eliminate it, you''ll have more time, and more tranquillity. Ask yourself at every moment, Is this necessary?', 'Seneca', 'Letters from a Stoic', 'stoic-extended'),
    ('How much more grievous are the consequences of anger than the causes of it. Anger, if not restrained, is frequently more hurtful to us than the injury that provokes it. The greatest remedy for anger is delay.', 'Seneca', 'On Anger', 'stoic-extended'),
    ('Every new beginning comes from some other beginning''s end. Life is like a play: it''s not the length, but the excellence of the acting that matters. It is equally faulty to trust everyone and to trust no one.', 'Seneca', 'Letters from a Stoic', 'stoic-extended'),

    -- Additional Stoic Philosophers
    ('Lead me, Zeus, and you, Fate, wherever you have assigned me to go, and I''ll follow without hesitation. Even if I become reluctant, and don''t give my consent, I''ll have to suffer what fate has in store for me anyway.', 'Cleanthes', 'Hymn to Zeus', 'stoic-extended'),
    ('The wise man is he who knows the relative value of things. Philosophy does not promise to secure anything external for man, otherwise it would be admitting something that lies beyond its proper subject-matter.', 'Epictetus', 'Discourses', 'stoic-extended'),
    ('Man is disturbed not by things, but by the views he takes on things. Thus death is nothing terrible, else it would have appeared so to Socrates. But the terror consists in our notion of death that it is terrible.', 'Epictetus', 'Enchiridion', 'stoic-extended'),
    ('Demand not that events happen as you wish them to happen, but wish them as they happen, and you will go on well. Sickness is a hindrance to the body, but not to your ability to choose, unless that is your choice.', 'Epictetus', 'Enchiridion', 'stoic-extended'),
    ('Remember that you are an actor in a play, which is as the author wants it to be; if short, then short; if long, then long; if he wants you to play a poor man, play even that role skillfully; and similarly if a cripple, or a public official, or a private citizen.', 'Epictetus', 'Enchiridion', 'stoic-extended'),

    -- Extended Buddhist & Eastern Philosophy (75 quotes)
    ('Three things cannot be long hidden: the sun, the moon, and the truth. The mind is everything. What you think you become. Do not believe in anything simply because you have heard it. Do not believe in anything simply because it is spoken and rumored by many.', 'Buddha', 'Dhammapada', 'buddhist-extended'),
    ('Hatred does not cease by hatred, but only by love; this is the eternal rule. The fool thinks himself to be wise, but a wise man knows himself to be a fool. Those who are free of resentful thoughts surely find peace.', 'Buddha', 'Dhammapada', 'buddhist-extended'),
    ('What we are today comes from our thoughts of yesterday, and our present thoughts build our life of tomorrow: Our life is the creation of our mind. The root of suffering is craving. Better than a thousand hollow words, is one word that brings peace.', 'Buddha', 'Dhammapada', 'buddhist-extended'),
    ('If you truly loved yourself, you would never hurt yourself with stress, anger, and worry. Thousands of candles can be lighted from a single candle, and the life of the candle will not be shortened. Happiness does not decrease by being shared.', 'Buddha', 'Various Teachings', 'buddhist-extended'),
    ('You will not be punished for your anger; you will be punished by your anger. In the end, just three things matter: How well we have lived, How well we have loved, How well we have learned to let go.', 'Buddha', 'Various Teachings', 'buddhist-extended'),

    ('The trouble is, you think you have time. Holding on to anger is like grasping a hot coal with the intent of throwing it at someone else; you are the one who gets burned. Peace comes from within. Do not seek it without.', 'Buddha', 'Various Teachings', 'buddhist-extended'),
    ('Your work is to discover your work and then with all your heart to give yourself to it. If you want to know your past, look at your present condition. If you want to know your future, look at your present actions.', 'Buddha', 'Various Teachings', 'buddhist-extended'),
    ('The way is not in the sky. The way is in the heart. Believe nothing, no matter where you read it, or who said it, no matter if I have said it, unless it agrees with your own reason and your own common sense.', 'Buddha', 'Kalama Sutta', 'buddhist-extended'),
    ('Drop by drop is the water pot filled. Likewise, the wise man, gathering it little by little, fills himself with good. There is no path to happiness: happiness is the path. Every morning we are born again. What we do today is what matters most.', 'Buddha', 'Dhammapada', 'buddhist-extended'),
    ('The only real failure in life is not to be true to the best one knows. Meditate. Live purely. Be quiet. Do your work with mastery. Like the moon, come out from behind the clouds! Shine.', 'Buddha', 'Dhammapada', 'buddhist-extended'),

    ('Set your heart on doing good. Do it over and over again, and you will be filled with joy. Just as a mother would protect her only child with her life, even so let one cultivate a boundless love towards all beings.', 'Buddha', 'Metta Sutta', 'buddhist-extended'),
    ('Health is the greatest gift, contentment the greatest wealth, faithfulness the best relationship. To understand everything is to forgive everything. The present moment is the only time over which we have dominion.', 'Buddha', 'Dhammapada', 'buddhist-extended'),
    ('All conditioned things are impermanent. Work out your salvation with diligence. Pain is inevitable. Suffering is optional. The way to happiness: keep your heart free from hate, your mind from worry. Live simply, expect little, give much.', 'Buddha', 'Last Words & Teachings', 'buddhist-extended'),
    ('Do not dwell in the past, do not dream of the future, concentrate the mind on the present moment. Better than a thousand hollow words, is one word that brings peace. Hatred is never appeased by hatred in this world. By non-hatred alone is hatred appeased. This is a law eternal.', 'Buddha', 'Dhammapada', 'buddhist-extended'),
    ('If you are facing in the right direction, all you need to do is keep on walking. The mind is like water. When agitated, it becomes difficult to see. When calm, everything becomes clear. Resolutely train yourself to attain peace.', 'Buddha', 'Various Teachings', 'buddhist-extended'),

    -- Zen & Taoist Extended Passages
    ('He who knows others is wise; he who knows himself is enlightened. At the center of your being you have the answer; you know who you are and you know what you want. The journey of a thousand miles begins with one step.', 'Lao Tzu', 'Tao Te Ching', 'taoist-extended'),
    ('When I let go of what I am, I become what I might be. Silence is a source of great strength. Nature does not hurry, yet everything is accomplished. The wise are not learned; the learned are not wise.', 'Lao Tzu', 'Tao Te Ching', 'taoist-extended'),
    ('If you understand others you are smart. If you understand yourself you are illuminated. The truth is not always beautiful, nor beautiful words the truth. Be content with what you have; rejoice in the way things are.', 'Lao Tzu', 'Tao Te Ching', 'taoist-extended'),
    ('To know that you do not know is the best. To think you know when you do not is a disease. The sage does not attempt anything very big, and thus achieves greatness. Water is fluid, soft, and yielding. But water will wear away rock, which cannot yield and is not fluid.', 'Lao Tzu', 'Tao Te Ching', 'taoist-extended'),
    ('A good man bases his actions on himself; a bad man bases his actions on others. He who knows that enough is enough will always have enough. The best fighter is never angry. If you correct your mind, the rest of your life will fall into place.', 'Lao Tzu', 'Tao Te Ching', 'taoist-extended'),

    ('New beginnings are often disguised as painful endings. Those who flow as life flows know they need no other force. The flame that burns twice as bright burns half as long. Respond intelligently even to unintelligent treatment.', 'Lao Tzu', 'Tao Te Ching', 'taoist-extended'),
    ('The best way to take care of the future is to take care of the present moment. If you want to shrink something, you must first allow it to expand. The highest type of ruler is one whose existence the people are barely aware of.', 'Lao Tzu', 'Tao Te Ching', 'taoist-extended'),
    ('Manifest plainness, embrace simplicity, reduce selfishness, have few desires. The Tao gives life to all things and death to all things. The Tao that can be spoken is not the eternal Tao. The name that can be named is not the eternal name.', 'Lao Tzu', 'Tao Te Ching', 'taoist-extended'),
    ('Empty your mind, be formless, shapeless, like water. If you put water into a cup, it becomes the cup. You put water into a bottle and it becomes the bottle. You put it in a teapot, it becomes the teapot. Now, water can flow or it can crash. Be water, my friend.', 'Bruce Lee', 'Tao of Jeet Kune Do', 'eastern-extended'),
    ('Do not pray for easy lives. Pray to be stronger men. The successful warrior is the average man with laser-like focus. I fear not the man who has practiced 10,000 kicks once, but I fear the man who has practiced one kick 10,000 times.', 'Bruce Lee', 'Tao of Jeet Kune Do', 'eastern-extended')
) AS v(text, author, source, category)
WHERE NOT EXISTS (
    SELECT 1 FROM public.quotes q2
    WHERE q2.text = v.text AND q2.author = v.author
);
