-- Recipe Jar — Seed Data
-- Run this in your Supabase SQL Editor AFTER running supabase-setup.sql
-- This inserts a "RecipeJar Team" system user and 20 sample recipes.

-- ============================================================
-- 1. SYSTEM USER
-- ============================================================
-- Insert into auth.users first (Supabase SQL Editor has service-role access)
INSERT INTO auth.users (
  id, email, encrypted_password, email_confirmed_at,
  created_at, updated_at, role, aud, raw_user_meta_data
) VALUES (
  '00000000-0000-0000-0000-000000000001',
  'team@recipejar.app',
  '',
  now(), now(), now(),
  'authenticated', 'authenticated',
  '{"username": "RecipeJarTeam"}'::jsonb
) ON CONFLICT (id) DO NOTHING;

-- Create the profile
INSERT INTO public.profiles (id, username, avatar_url)
VALUES (
  '00000000-0000-0000-0000-000000000001',
  'RecipeJarTeam',
  null
) ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- 2. SAMPLE RECIPES (20 diverse recipes)
-- ============================================================
INSERT INTO public.recipes
  (user_id, title, description, ingredients, steps, image_url,
   cuisine_tag, difficulty_tag, time_tag, diet_tag, likes_count)
VALUES

-- 1
('00000000-0000-0000-0000-000000000001',
 'Butter Chicken',
 'A rich, creamy Indian classic with tender chicken in a spiced tomato-butter sauce. Perfect served over basmati rice.',
 '500g chicken breast, cubed
1 cup plain yogurt
2 tbsp butter
1 onion, finely chopped
400g canned crushed tomatoes
1 tsp garam masala
1 tsp cumin
200ml heavy cream
Salt and pepper to taste',
 'Marinate chicken in yogurt, cumin, and salt for 30 minutes
Sauté onion in butter until golden, about 8 minutes
Add tomatoes and garam masala, simmer 10 minutes
Add chicken and cook through, about 12 minutes
Stir in cream, simmer 5 more minutes and serve',
 'https://images.unsplash.com/photo-1603894070024-9d8b8f4dcd8b?w=800',
 'Indian', 'Medium', '30-60 min', 'Non-Vegetarian', 47),

-- 2
('00000000-0000-0000-0000-000000000001',
 'Spaghetti Carbonara',
 'A classic Roman pasta dish with silky egg sauce, crispy pancetta, and a generous handful of Pecorino Romano.',
 '400g spaghetti
150g pancetta or guanciale
4 egg yolks
100g Pecorino Romano, grated
2 cloves garlic
Black pepper, freshly cracked
Salt for pasta water',
 'Cook spaghetti in heavily salted water until al dente
Fry pancetta until crispy, keep the rendered fat
Whisk egg yolks with Pecorino and lots of black pepper
Toss hot pasta with pancetta off heat
Add egg mixture quickly, tossing to create creamy sauce',
 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800',
 'Italian', 'Medium', '15-30 min', 'Non-Vegetarian', 62),

-- 3
('00000000-0000-0000-0000-000000000001',
 'Avocado Toast with Poached Eggs',
 'A simple but satisfying breakfast with creamy avocado on crusty sourdough topped with perfectly poached eggs.',
 '2 slices sourdough bread
1 ripe avocado
2 eggs
1 tbsp white vinegar
Red pepper flakes
Lemon juice
Salt and pepper',
 'Toast sourdough until golden and crisp
Mash avocado with lemon juice, salt and pepper
Bring a pot of water with vinegar to a gentle simmer
Poach eggs for 3 minutes until whites set
Top toast with avocado then poached eggs, finish with chili flakes',
 'https://images.unsplash.com/photo-1483695028939-5bb13f8648b0?w=800',
 'American', 'Easy', 'Under 15 min', 'Vegetarian', 38),

-- 4
('00000000-0000-0000-0000-000000000001',
 'Street Tacos al Pastor',
 'Juicy marinated pork tacos inspired by Mexican street food, topped with fresh pineapple, cilantro, and salsa.',
 '500g pork shoulder, thinly sliced
3 chipotle chiles in adobo
1 tsp cumin and oregano
200g canned pineapple chunks
Small corn tortillas
Fresh cilantro
Diced white onion
Lime wedges',
 'Blend chipotles, cumin, oregano into a paste
Marinate pork in paste for 2 hours or overnight
Cook pork in a hot cast iron until charred at edges
Warm tortillas on dry skillet
Assemble tacos with pork, pineapple, onion, cilantro and lime',
 'https://images.unsplash.com/photo-1565958152026-3c25e9b95a5f?w=800',
 'Mexican', 'Medium', '30-60 min', 'Non-Vegetarian', 55),

-- 5
('00000000-0000-0000-0000-000000000001',
 'Pad Thai',
 'Thailand''s most famous noodle dish — chewy rice noodles tossed with egg, bean sprouts, and a tangy tamarind sauce.',
 '200g flat rice noodles
2 eggs
100g firm tofu, cubed
3 tbsp tamarind paste
2 tbsp fish sauce
1 tbsp palm sugar
Bean sprouts
3 spring onions
Crushed peanuts for serving',
 'Soak rice noodles in warm water 20 minutes then drain
Mix tamarind, fish sauce and sugar into a sauce
Fry tofu until golden, push to side, scramble eggs
Add noodles and sauce, toss on high heat
Add bean sprouts, toss 1 minute, serve topped with peanuts',
 'https://images.unsplash.com/photo-1559314809-0d155014e29e?w=800',
 'Thai', 'Medium', '15-30 min', 'Vegetarian', 41),

-- 6
('00000000-0000-0000-0000-000000000001',
 'Margherita Pizza',
 'The queen of pizzas — a thin, blistered crust topped with San Marzano tomatoes, fresh mozzarella, and basil.',
 '250g pizza dough
100ml passata
125g fresh mozzarella
Fresh basil leaves
1 tbsp olive oil
Salt to taste',
 'Preheat oven to maximum with a pizza stone or heavy tray
Stretch dough into a thin 30cm circle
Spread passata, tear over mozzarella and season
Bake 8-10 minutes until crust is blistered and charred
Remove, scatter basil, drizzle olive oil and serve immediately',
 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=800',
 'Italian', 'Medium', '30-60 min', 'Vegetarian', 73),

-- 7
('00000000-0000-0000-0000-000000000001',
 'Classic Beef Burger',
 'A juicy homemade smash burger with a crispy sear, melted cheddar, and all the classic toppings on a brioche bun.',
 '400g 80/20 ground beef
4 brioche buns
4 slices cheddar cheese
Lettuce, tomato, onion
2 tbsp mayonnaise
1 tbsp ketchup
Salt and pepper',
 'Divide beef into 4 loose balls, season generously
Heat cast iron pan until smoking hot
Add balls and immediately smash flat with spatula
Cook 2 minutes, flip, add cheese, cook 1 minute
Spread sauce on toasted bun, layer with toppings and patty',
 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=800',
 'American', 'Easy', '15-30 min', 'Non-Vegetarian', 81),

-- 8
('00000000-0000-0000-0000-000000000001',
 'Miso Ramen',
 'A deeply savory Japanese noodle soup with a rich miso broth, chashu pork, soft-boiled egg, and nori.',
 '4 cups chicken broth
3 tbsp white miso paste
200g ramen noodles
2 soft-boiled eggs
150g chashu pork belly (or store-bought)
2 sheets nori
Spring onions
1 tbsp sesame oil
Corn kernels',
 'Warm broth and whisk in miso paste until dissolved
Cook ramen noodles per package instructions
Slice chashu pork into rounds
Ladle hot broth into bowls with cooked noodles
Top with pork, halved egg, nori, spring onions and a drizzle of sesame oil',
 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=800',
 'Japanese', 'Hard', '30-60 min', 'Non-Vegetarian', 66),

-- 9
('00000000-0000-0000-0000-000000000001',
 'Greek Salad',
 'A vibrant Mediterranean salad with chunky vegetables, briny olives, and creamy feta, dressed in lemon and olive oil.',
 '3 large ripe tomatoes, chunked
1 cucumber, chunked
1 red onion, sliced
150g Kalamata olives
200g block feta cheese
3 tbsp extra virgin olive oil
1 tbsp dried oregano
Salt and lemon juice',
 'Chop tomatoes, cucumber and onion into large pieces
Add to a wide bowl with olives
Place whole feta block on top
Drizzle generously with olive oil
Sprinkle oregano, squeeze lemon, season with salt and serve',
 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=800',
 'Mediterranean', 'Easy', 'Under 15 min', 'Vegetarian', 34),

-- 10
('00000000-0000-0000-0000-000000000001',
 'Chicken Tikka Masala',
 'Smoky grilled chicken pieces in a luscious, mildly spiced tomato-cream sauce — a British-Indian favourite.',
 '600g chicken breast
1 cup yogurt for marinade
1 tsp each: turmeric, cumin, coriander, garam masala
400g canned tomatoes
1 onion, diced
4 cloves garlic
200ml heavy cream
Fresh coriander to serve',
 'Marinate chicken in yogurt and spices for at least 1 hour
Grill or broil chicken until charred at edges
Sauté onion and garlic until soft, add tomatoes and spices
Simmer sauce 15 minutes until thickened
Add grilled chicken and cream, simmer 5 minutes, garnish and serve',
 'https://images.unsplash.com/photo-1596040033229-a537b39f4e8f?w=800',
 'Indian', 'Medium', '30-60 min', 'Non-Vegetarian', 58),

-- 11
('00000000-0000-0000-0000-000000000001',
 'Salmon Teriyaki',
 'Glossy, sweet-savory glazed salmon fillets served over steamed rice with sesame seeds and sliced spring onion.',
 '4 salmon fillets
3 tbsp soy sauce
2 tbsp mirin
1 tbsp sake
1 tbsp honey
Sesame seeds
Spring onions
Steamed rice to serve',
 'Mix soy sauce, mirin, sake, and honey in a small pan, simmer until slightly thickened
Pat salmon dry and season lightly
Cook salmon in a hot oiled pan skin-side down for 4 minutes
Flip, pour glaze over fish, cook 2 more minutes basting constantly
Serve over rice, scatter sesame seeds and spring onions',
 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800',
 'Japanese', 'Easy', '15-30 min', 'Pescatarian', 44),

-- 12
('00000000-0000-0000-0000-000000000001',
 'Shakshuka',
 'Eggs poached in a spiced, smoky tomato and pepper sauce — a Middle Eastern breakfast that works any time of day.',
 '6 large eggs
2 cans crushed tomatoes
2 red peppers, diced
1 onion, diced
3 cloves garlic
1 tsp cumin and paprika
Fresh parsley
Crusty bread to serve',
 'Sauté onion and peppers in olive oil until soft
Add garlic and spices, cook 1 minute
Pour in tomatoes, simmer 10 minutes until sauce thickens
Make wells in sauce and crack eggs in
Cover and cook 6-8 minutes until whites are set, yolks still runny
Scatter parsley and serve from the pan with bread',
 'https://images.unsplash.com/photo-1590412200988-a436970781fa?w=800',
 'Mediterranean', 'Easy', '15-30 min', 'Vegetarian', 52),

-- 13
('00000000-0000-0000-0000-000000000001',
 'Kung Pao Chicken',
 'A fiery Sichuan classic with tender chicken, crunchy peanuts, and dried chillies in a bold, sweet-spicy sauce.',
 '500g chicken thigh, cubed
100g roasted peanuts
10 dried red chillies
3 cloves garlic, minced
2 tsp cornstarch
3 tbsp soy sauce
1 tbsp rice vinegar
1 tsp sugar
Sichuan peppercorns',
 'Marinate chicken in soy sauce and cornstarch for 15 minutes
Mix remaining soy, vinegar, and sugar into sauce
Stir-fry chillies and peppercorns in hot oil until fragrant
Add chicken and cook until browned
Pour in sauce, toss with peanuts, serve immediately',
 'https://images.unsplash.com/photo-1563379926898-9e4b8264ba49?w=800',
 'Chinese', 'Medium', '15-30 min', 'Non-Vegetarian', 49),

-- 14
('00000000-0000-0000-0000-000000000001',
 'Fluffy Pancakes',
 'Thick, cloud-like American pancakes that are crispy on the outside and melt-in-your-mouth soft on the inside.',
 '2 cups all-purpose flour
2 tbsp sugar
1 tsp baking powder and baking soda
2 eggs
1.5 cups buttermilk
3 tbsp melted butter
Maple syrup and butter to serve',
 'Whisk dry ingredients together in a large bowl
Whisk eggs, buttermilk and melted butter in another bowl
Fold wet into dry until just combined — lumps are fine
Heat a non-stick pan on medium-low, lightly grease
Cook pancakes until bubbles appear (2-3 min), flip, cook 1 more minute',
 'https://images.unsplash.com/photo-1484723091838-16630b0e7b64?w=800',
 'American', 'Easy', '15-30 min', 'Vegetarian', 61),

-- 15
('00000000-0000-0000-0000-000000000001',
 'Tom Yum Soup',
 'A hot and sour Thai soup with succulent shrimp, lemongrass, galangal, and fragrant kaffir lime leaves.',
 '400g shrimp, peeled
4 cups chicken or vegetable broth
2 stalks lemongrass, bruised
4 slices galangal
4 kaffir lime leaves
200g mushrooms
3 tbsp fish sauce
2 tbsp lime juice
Fresh red chilli and coriander',
 'Bring broth to a boil with lemongrass, galangal and lime leaves
Simmer 5 minutes to infuse flavors, then add mushrooms
Add shrimp and cook 2-3 minutes until pink
Season with fish sauce and lime juice
Serve topped with fresh chilli and coriander',
 'https://images.unsplash.com/photo-1547592166-23ac45744acd?w=800',
 'Thai', 'Easy', '15-30 min', 'Pescatarian', 36),

-- 16
('00000000-0000-0000-0000-000000000001',
 'Vegetable Fried Rice',
 'A quick, satisfying stir-fried rice packed with colourful vegetables and seasoned with soy and sesame.',
 '3 cups cooked jasmine rice (day-old is best)
3 eggs
1 cup frozen peas and carrots
1 onion, diced
3 cloves garlic
3 tbsp soy sauce
1 tbsp sesame oil
Spring onions and sesame seeds to finish',
 'Heat wok until smoking, add oil and fry garlic and onion
Push aside, scramble eggs on empty side
Add rice, breaking up any clumps on high heat
Toss in peas and carrots, stir-fry 2 minutes
Season with soy and sesame oil, serve topped with spring onions',
 'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=800',
 'Chinese', 'Easy', 'Under 15 min', 'Vegetarian', 43),

-- 17
('00000000-0000-0000-0000-000000000001',
 'Lentil Dal',
 'A warming, protein-rich Indian lentil stew tempered with mustard seeds, cumin, and fresh curry leaves.',
 '2 cups red lentils
1 onion, finely diced
3 tomatoes, chopped
1 tsp turmeric and cumin
1 tsp mustard seeds
10 fresh curry leaves
3 cloves garlic
2 tbsp ghee or oil',
 'Rinse lentils and cook with turmeric in water until soft, about 20 minutes
Heat ghee in a pan, splutter mustard seeds
Add curry leaves, garlic and onion, fry until golden
Add tomatoes and cook until pulpy
Pour tempering over lentils, stir and simmer 5 minutes',
 'https://images.unsplash.com/photo-1574894709920-11b28e7367e3?w=800',
 'Indian', 'Easy', '30-60 min', 'Vegan', 39),

-- 18
('00000000-0000-0000-0000-000000000001',
 'Classic Beef Steak',
 'A perfectly seared ribeye with a garlic-herb butter baste — restaurant quality made effortlessly at home.',
 '2 ribeye steaks (300g each)
3 tbsp butter
4 cloves garlic, crushed
Fresh thyme and rosemary
Flaky sea salt
Cracked black pepper
Olive oil',
 'Take steaks out 45 minutes before cooking, pat dry, season liberally
Heat cast iron pan until smoking, add a thin layer of oil
Sear steaks 2-3 minutes per side for medium-rare
Add butter, garlic and herbs, baste continuously for 1 minute
Rest steaks 5 minutes on a board before slicing',
 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800',
 'American', 'Hard', '15-30 min', 'Non-Vegetarian', 88),

-- 19
('00000000-0000-0000-0000-000000000001',
 'Caprese Salad',
 'The simplest Italian salad — thick slices of ripe tomato and fresh mozzarella with fragrant basil and good olive oil.',
 '4 large ripe tomatoes
250g fresh buffalo mozzarella
Large bunch fresh basil
4 tbsp extra virgin olive oil
Flaky sea salt
Cracked black pepper
Balsamic glaze (optional)',
 'Slice tomatoes and mozzarella into 1cm rounds
Alternate tomato and mozzarella slices on a platter
Tuck whole basil leaves between slices
Drizzle generously with best quality olive oil
Finish with flaky salt, pepper, and balsamic glaze if using',
 'https://images.unsplash.com/photo-1546069901-d5bfd2cbfb1f?w=800',
 'Italian', 'Easy', 'Under 15 min', 'Vegetarian', 29),

-- 20
('00000000-0000-0000-0000-000000000001',
 'Chocolate Lava Cake',
 'Individual warm chocolate cakes with a gooey molten centre — elegant enough for dinner parties, easy enough for weeknights.',
 '150g dark chocolate (70%)
150g unsalted butter
3 eggs and 3 egg yolks
150g icing sugar
50g plain flour
Pinch of salt
Vanilla ice cream to serve',
 'Preheat oven to 200°C and butter 6 ramekins
Melt chocolate and butter together, cool slightly
Whisk eggs, yolks, and sugar until pale and thick
Fold chocolate into egg mixture, then fold in flour
Fill ramekins 3/4 full, bake 12 minutes until edges set but centre jiggles
Immediately invert onto plates, serve with ice cream',
 'https://images.unsplash.com/photo-1549482585-8c94b7f3b8d8?w=800',
 'American', 'Hard', '30-60 min', 'Vegetarian', 94);
