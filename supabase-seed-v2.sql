-- ============================================================
-- Recipe Jar - Seed Data v2 (50 recipes)
-- Run this in your Supabase SQL Editor AFTER running supabase-setup.sql
-- WARNING: This deletes ALL existing recipes before inserting new ones.
-- ============================================================

DO $$
DECLARE
  team_id uuid := '00000000-0000-0000-0000-000000000099';
BEGIN

  -- Ensure system user exists in auth.users
  INSERT INTO auth.users (
    id, aud, role, email, encrypted_password,
    email_confirmed_at, created_at, updated_at,
    raw_app_meta_data, raw_user_meta_data, is_super_admin
  ) VALUES (
    team_id, 'authenticated', 'authenticated',
    'team@recipejar.internal', '',
    now(), now(), now(),
    '{"provider":"email","providers":["email"]}'::jsonb,
    '{"username":"RecipeJarTeam"}'::jsonb,
    false
  ) ON CONFLICT (id) DO NOTHING;

  -- Ensure team profile exists
  INSERT INTO public.profiles (id, username)
  VALUES (team_id, 'RecipeJarTeam')
  ON CONFLICT (id) DO NOTHING;

  -- Delete all existing recipes
  DELETE FROM public.recipes;

  -- ============================================================
  -- INSERT 50 RECIPES
  -- ============================================================
  INSERT INTO public.recipes
    (user_id, title, description, ingredients, steps, image_url,
     cuisine_tag, difficulty_tag, time_tag, diet_tag, likes_count)
  VALUES

  -- ======================================================
  -- INDIAN (10)
  -- ======================================================

  (team_id,
   'Butter Chicken',
   'A velvety, mildly spiced tomato and cream curry with tender chicken - the dish that made Indian food famous worldwide.',
   '500g chicken thighs, boneless
1 cup tomato puree
1/2 cup heavy cream
2 tbsp butter
1 tsp garam masala
1 tsp cumin
1 tsp coriander powder
Salt to taste',
   'Marinate chicken in yogurt and spices for 30 minutes
Sear chicken pieces in butter until golden on all sides
Add tomato puree and simmer for 10 minutes
Stir in cream and garam masala
Simmer on low heat for 5 more minutes until sauce thickens
Serve with naan or basmati rice',
   null, 'Indian', 'Medium', '30-60 min', 'Non-Vegetarian', 0),

  (team_id,
   'Paneer Butter Masala',
   'Soft cubes of paneer simmered in a rich, velvety tomato-cashew gravy - a vegetarian showstopper.',
   '250g paneer, cubed
1 cup tomato puree
2 tbsp cashew paste
2 tbsp butter
1 tsp garam masala
1/2 cup cream
1 tsp sugar
Salt to taste',
   'Lightly fry paneer cubes until golden, set aside
Melt butter and saute onions until soft and golden
Add tomato puree and cook for 8 minutes
Stir in cashew paste and cream until smooth
Add paneer and simmer for 5 minutes
Finish with garam masala, sugar, and salt',
   null, 'Indian', 'Easy', '30-60 min', 'Vegetarian', 0),

  (team_id,
   'Dal Tadka',
   'Comforting yellow lentils finished with a sizzling ghee tadka of cumin, garlic, and dried red chilli.',
   '1 cup toor dal (yellow lentils)
3 cups water
2 tbsp ghee
1 tsp cumin seeds
3 garlic cloves, sliced thin
2 dried red chillies
1/2 tsp turmeric
Salt to taste',
   'Pressure cook dal with water and turmeric until very soft
Mash lightly with a spoon and season with salt
Heat ghee in a small pan over medium-high
Add cumin seeds and let them splutter
Add garlic slices and red chillies, fry until golden
Pour entire tadka over the dal and serve immediately',
   null, 'Indian', 'Easy', '30-60 min', 'Vegan', 0),

  (team_id,
   'Chole Bhature',
   'Fluffy, puffed deep-fried bread served alongside spiced chickpea curry - the ultimate Punjabi street food.',
   '2 cups chickpeas, soaked overnight
2 onions, finely chopped
3 tomatoes, pureed
1 tsp each: chole masala, cumin, coriander
2 cups all-purpose flour for bhature
Oil for deep frying
Fresh coriander and lemon to serve',
   'Pressure cook soaked chickpeas until tender
Saute onions until deep golden, add tomato puree
Add spices and cook until oil separates
Add chickpeas with water, simmer 15 minutes
For bhature, knead flour with yogurt and rest 30 minutes
Roll and deep fry until puffed and golden',
   null, 'Indian', 'Hard', '30-60 min', 'Vegan', 0),

  (team_id,
   'Chicken Biryani',
   'Fragrant basmati rice layered with spiced chicken, caramelised onions, and saffron - slow-cooked to perfection.',
   '500g chicken, bone-in pieces
2 cups basmati rice
2 large onions, thinly sliced
1/2 cup yogurt
1 tsp each: biryani masala, garam masala, turmeric
Saffron soaked in warm milk
4 tbsp ghee
Mint leaves',
   'Marinate chicken in yogurt and spices for 1 hour
Fry onions until caramelised and crispy, set aside
Cook marinated chicken until 80% done
Par-boil rice with whole spices until 70% cooked
Layer chicken then rice in a heavy pot
Top with saffron milk, mint, and crispy onions
Seal and dum-cook on low heat for 25 minutes',
   null, 'Indian', 'Hard', '30-60 min', 'Non-Vegetarian', 0),

  (team_id,
   'Aloo Gobi',
   'A dry, aromatic stir-fry of potatoes and cauliflower spiced with cumin, turmeric, and coriander.',
   '3 medium potatoes, cubed
1 small cauliflower, cut into florets
1 tsp cumin seeds
1 tsp turmeric
1 tsp coriander powder
1/2 tsp garam masala
2 tbsp oil
Fresh coriander to garnish',
   'Heat oil and splutter cumin seeds
Add potatoes and fry on medium heat for 8 minutes
Add cauliflower and all dry spices, mix well
Cook covered on low heat for 15 minutes
Uncover and cook until both are tender and lightly browned
Garnish with fresh coriander and serve',
   null, 'Indian', 'Easy', '30-60 min', 'Vegan', 0),

  (team_id,
   'Palak Paneer',
   'Creamy spinach curry with soft paneer - a classic that''s as nutritious as it is delicious.',
   '250g paneer, cubed
400g fresh spinach
1 onion, chopped
2 tomatoes, chopped
1 tsp garam masala
1 tsp cumin
2 garlic cloves
1 inch ginger
2 tbsp cream',
   'Blanch spinach in boiling water for 2 minutes, refresh in cold water
Blend spinach into a smooth puree
Saute onion, garlic, and ginger until soft
Add tomatoes and cook until pulpy
Add spinach puree and simmer for 5 minutes
Add paneer and cream, cook 3 more minutes',
   null, 'Indian', 'Easy', '30-60 min', 'Vegetarian', 0),

  (team_id,
   'Masala Dosa',
   'Crispy fermented rice crepe filled with spiced potato masala - South India''s most iconic breakfast.',
   '2 cups dosa batter (fermented rice and lentil)
3 potatoes, boiled and mashed
1 onion, sliced
1 tsp mustard seeds
10 curry leaves
1/2 tsp turmeric
2 green chillies
Oil for cooking',
   'Make potato masala: fry mustard seeds and curry leaves in oil
Add onion, green chilli, and turmeric, saute until soft
Mix in mashed potato and cook 3 minutes, set aside
Pour a ladle of dosa batter on a hot griddle and spread thin
Drizzle oil on edges and cook until golden and crisp
Place potato masala in centre, fold and serve with chutney',
   null, 'Indian', 'Hard', '30-60 min', 'Vegan', 0),

  (team_id,
   'Samosa',
   'Golden, crispy pastry shells stuffed with spiced potato and pea filling - the king of Indian street snacks.',
   '2 cups all-purpose flour for pastry
3 large potatoes, boiled and mashed
1/2 cup green peas
1 tsp cumin seeds
1 tsp coriander powder
1/2 tsp garam masala
1/2 tsp amchur (dry mango powder)
Oil for deep frying',
   'Make dough with flour, oil, and water; rest 30 minutes
Cook peas with cumin and spices, mix into mashed potato
Divide dough into balls and roll into ovals
Cut in half, form cone, fill with potato mixture, seal edges
Deep fry on medium heat until evenly golden and crisp
Serve hot with mint chutney and tamarind sauce',
   null, 'Indian', 'Hard', '30-60 min', 'Vegan', 0),

  (team_id,
   'Rajma Chawal',
   'Hearty red kidney beans in a thick, aromatic onion-tomato gravy - the ultimate comfort food with steamed rice.',
   '1.5 cups red kidney beans, soaked overnight
2 onions, finely chopped
3 tomatoes, pureed
1 tsp each: cumin, coriander, garam masala, chilli powder
2 garlic cloves, minced
1 inch ginger, grated
2 tbsp oil
Steamed basmati rice to serve',
   'Pressure cook soaked rajma with salt until very tender
Saute onions in oil until deep golden brown
Add ginger-garlic paste and cook 2 minutes
Add tomato puree and all spices, cook until oil separates
Add cooked rajma with 1 cup water, simmer 20 minutes
Mash a few beans for thickness, serve over rice',
   null, 'Indian', 'Medium', '30-60 min', 'Vegan', 0),

  -- ======================================================
  -- ITALIAN (7)
  -- ======================================================

  (team_id,
   'Pasta Carbonara',
   'The classic Roman pasta - silky egg and pecorino sauce clings to spaghetti with crispy guanciale and cracked pepper.',
   '200g spaghetti
100g guanciale or pancetta, diced
2 large eggs + 2 yolks
50g pecorino romano, grated
50g parmesan, grated
Freshly cracked black pepper
Salt for pasta water',
   'Cook spaghetti in well-salted boiling water until al dente
Fry guanciale until crispy, remove pan from heat
Whisk eggs and yolks with most of the cheese and lots of pepper
Drain pasta, reserving 1 cup pasta water
Toss hot pasta with guanciale and its fat
Off heat, pour egg mix over pasta, toss fast adding pasta water to loosen
Serve immediately with extra cheese and pepper',
   null, 'Italian', 'Medium', '15-30 min', 'Non-Vegetarian', 0),

  (team_id,
   'Margherita Pizza',
   'The original Neapolitan pizza - thin charred crust, crushed San Marzano tomatoes, fresh mozzarella, and basil.',
   '250g pizza dough
1/2 cup San Marzano tomato sauce
125g fresh mozzarella, torn
Fresh basil leaves
2 tbsp extra virgin olive oil
Flaky salt',
   'Preheat oven to 250 degrees C with a pizza stone or heavy tray inside
Stretch dough into a thin 30cm round by hand
Spread tomato sauce leaving a 2cm border
Scatter torn mozzarella evenly
Bake 8-10 minutes until crust is blistered and charred
Top with fresh basil and a drizzle of olive oil',
   null, 'Italian', 'Medium', '30-60 min', 'Vegetarian', 0),

  (team_id,
   'Mushroom Risotto',
   'Creamy Italian rice dish slowly cooked with white wine, parmesan, and earthy mixed mushrooms.',
   '300g arborio rice
400g mixed mushrooms, sliced
1 litre vegetable or chicken stock, warm
1 onion, finely diced
2 garlic cloves
100ml dry white wine
50g parmesan, grated
2 tbsp butter',
   'Saute onion and garlic in butter until soft, add rice and toast 2 minutes
Add wine and stir until absorbed
Add warm stock one ladle at a time, stirring constantly
Meanwhile fry mushrooms separately in butter until golden
Fold mushrooms into risotto at the halfway point
When rice is creamy and al dente, stir in parmesan and remaining butter
Rest 1 minute and serve immediately',
   null, 'Italian', 'Medium', '30-60 min', 'Vegetarian', 0),

  (team_id,
   'Bruschetta al Pomodoro',
   'Grilled sourdough rubbed with garlic and piled with ripe tomatoes, basil, and good olive oil.',
   '4 slices sourdough or ciabatta
3 ripe tomatoes, diced
1 garlic clove (for rubbing)
A handful of fresh basil leaves, torn
3 tbsp extra virgin olive oil
Flaky sea salt and black pepper',
   'Grill or toast bread slices until golden and charred at edges
Immediately rub one side with the cut garlic clove
Mix diced tomatoes with olive oil, basil, salt, and pepper
Let tomato mixture rest 5 minutes for juices to release
Pile generously onto the garlicky toast and serve at once',
   null, 'Italian', 'Easy', 'Under 15 min', 'Vegan', 0),

  (team_id,
   'Lasagna al Forno',
   'Classic baked lasagna with rich bolognese, creamy bechamel, and melted mozzarella - comfort food at its finest.',
   '12 lasagna sheets
500g ground beef
400g canned crushed tomatoes
1 onion, diced
2 garlic cloves
For bechamel: 50g butter, 50g flour, 500ml milk
200g mozzarella, grated
50g parmesan',
   'Make bolognese: brown beef, add onion and garlic, add tomatoes, simmer 30 minutes
Make bechamel: melt butter, whisk in flour, gradually add milk until thick
Cook lasagna sheets or use no-boil sheets
Layer in baking dish: bolognese, pasta, bechamel, repeat
Top with mozzarella and parmesan
Bake at 180 degrees C for 40 minutes until golden and bubbling',
   null, 'Italian', 'Hard', '30-60 min', 'Non-Vegetarian', 0),

  (team_id,
   'Pesto Pasta',
   'Bright, fragrant homemade basil pesto tossed with al dente pasta - ready in under 20 minutes.',
   '300g trofie or penne pasta
2 cups fresh basil leaves, packed
3 tbsp pine nuts, toasted
2 garlic cloves
60g parmesan, grated
80ml extra virgin olive oil
Salt and pepper',
   'Blend basil, pine nuts, garlic, and parmesan in a food processor
Stream in olive oil while blending until smooth
Season pesto with salt and pepper
Cook pasta in salted water until al dente, reserve 1/2 cup pasta water
Drain pasta and toss immediately with pesto
Add a splash of pasta water to loosen if needed',
   null, 'Italian', 'Easy', '15-30 min', 'Vegetarian', 0),

  (team_id,
   'Tiramisu',
   'The iconic Italian dessert - espresso-soaked ladyfingers layered with mascarpone cream and dusted with cocoa.',
   '250g mascarpone cheese
3 eggs, separated
80g caster sugar
200ml strong espresso, cooled
200g savoiardi (ladyfinger biscuits)
2 tbsp dark rum or marsala (optional)
Cocoa powder to dust',
   'Whisk egg yolks with sugar until pale and thick
Fold in mascarpone until smooth
Whisk egg whites to stiff peaks and fold into mascarpone mixture
Mix espresso with rum
Dip each ladyfinger briefly in espresso and layer in a dish
Spread half the cream, repeat with more biscuits and cream
Refrigerate at least 4 hours, dust with cocoa before serving',
   null, 'Italian', 'Medium', '30-60 min', 'Vegetarian', 0),

  -- ======================================================
  -- MEXICAN (8)
  -- ======================================================

  (team_id,
   'Chicken Tacos',
   'Juicy grilled chicken with smoky seasoning in warm corn tortillas, topped with pico de gallo and lime crema.',
   '400g chicken thighs, boneless
2 tsp cumin
1 tsp smoked paprika
1 tsp garlic powder
8 small corn tortillas
1 cup pico de gallo
1/2 cup sour cream
1 lime
Fresh coriander',
   'Mix cumin, paprika, garlic powder with salt and coat chicken thighs
Grill or pan-sear chicken for 6-7 minutes per side until cooked through
Rest 5 minutes then slice thinly against the grain
Warm tortillas directly over flame or in dry pan
Mix sour cream with lime juice for quick crema
Assemble tacos with chicken, pico de gallo, crema, and coriander',
   null, 'Mexican', 'Easy', '15-30 min', 'Non-Vegetarian', 0),

  (team_id,
   'Guacamole',
   'Creamy, fresh guacamole with perfectly ripe avocados, jalapeno, red onion, and lime - done in 10 minutes.',
   '3 ripe avocados
1 lime, juiced
1/2 small red onion, finely diced
1 jalapeno, seeded and minced
2 tbsp fresh coriander, chopped
1/2 tsp salt
Tortilla chips to serve',
   'Halve avocados, remove pit, and scoop flesh into a bowl
Mash to your preferred consistency - chunky or smooth
Add lime juice immediately to prevent browning
Fold in red onion, jalapeno, and coriander
Season with salt and taste - adjust lime if needed
Serve immediately with tortilla chips',
   null, 'Mexican', 'Easy', 'Under 15 min', 'Vegan', 0),

  (team_id,
   'Burrito Bowl',
   'A satisfying, customisable bowl with Mexican rice, black beans, grilled chicken, corn salsa, and sour cream.',
   '2 cups cooked Mexican rice (with cumin and tomato)
1 can black beans, drained
300g chicken breast, seasoned
1 cup corn kernels
1/2 cup sour cream
1/2 cup salsa
1 avocado, sliced
Lime and coriander',
   'Season chicken with cumin, paprika, and salt, then grill or pan-fry until cooked
Slice chicken and warm black beans separately
Build the bowl: start with rice as the base
Top with chicken, beans, corn, and avocado slices
Add dollops of sour cream and salsa
Finish with a squeeze of lime and fresh coriander',
   null, 'Mexican', 'Easy', '15-30 min', 'Non-Vegetarian', 0),

  (team_id,
   'Quesadilla',
   'Crispy flour tortillas stuffed with melted cheese, black beans, and peppers - golden and gooey in 15 minutes.',
   '4 large flour tortillas
1.5 cups cheddar or Oaxaca cheese, grated
1/2 cup black beans, drained
1 red pepper, sliced thin
1/2 tsp cumin
Sour cream and salsa to serve
Oil or butter for cooking',
   'Mix beans with cumin and a pinch of salt
Lay a tortilla flat and scatter half with cheese
Add beans and peppers on the same half, fold over
Cook in a lightly oiled pan over medium heat
Press gently for 2-3 minutes until golden, flip carefully
Cook other side until crispy and cheese is fully melted
Cut into wedges and serve with sour cream and salsa',
   null, 'Mexican', 'Easy', 'Under 15 min', 'Vegetarian', 0),

  (team_id,
   'Churros with Chocolate Sauce',
   'Crispy fried dough fingers coated in cinnamon sugar, served with a thick, dark chocolate dipping sauce.',
   '1 cup water
1 cup all-purpose flour
1 tbsp sugar
1/2 tsp salt
2 tbsp butter
Oil for deep frying
1/2 cup caster sugar + 1 tsp cinnamon for coating
100g dark chocolate + 1/2 cup cream for sauce',
   'Boil water with butter, sugar, and salt
Add flour all at once and stir vigorously into a smooth dough
Transfer to a piping bag with a star nozzle
Pipe 12cm lengths into hot oil (180 degrees C) and fry until golden
Drain and immediately roll in cinnamon sugar
Melt chocolate with warm cream for dipping sauce',
   null, 'Mexican', 'Medium', '30-60 min', 'Vegetarian', 0),

  (team_id,
   'Enchiladas',
   'Corn tortillas rolled around spiced chicken and smothered in red enchilada sauce with melted cheese.',
   '8 corn tortillas
300g cooked shredded chicken
2 cups red enchilada sauce
1.5 cups cheddar cheese, grated
1/2 onion, diced
1 tsp cumin
Sour cream and fresh coriander to serve',
   'Mix shredded chicken with onion, cumin, and half the enchilada sauce
Warm tortillas briefly so they're pliable
Fill each tortilla with chicken mixture and roll tightly
Place seam-down in a greased baking dish
Pour remaining enchilada sauce over the top
Cover with cheese and bake at 180 degrees C for 20 minutes until bubbly',
   null, 'Mexican', 'Medium', '30-60 min', 'Non-Vegetarian', 0),

  (team_id,
   'Loaded Nachos',
   'Crispy tortilla chips loaded with melted cheese, jalapenos, black beans, pico de gallo, and sour cream.',
   '200g tortilla chips
1.5 cups cheddar or Monterey Jack, grated
1 can black beans, drained
1/2 cup pickled jalapeno slices
1 cup pico de gallo
1/2 cup sour cream
1 avocado, diced',
   'Preheat oven to 200 degrees C
Spread chips in a single layer on a large baking tray
Scatter beans evenly, then cover generously with cheese
Add jalapeno slices on top
Bake 10 minutes until cheese is fully melted and bubbling
Top with pico de gallo, avocado, and sour cream before serving',
   null, 'Mexican', 'Easy', 'Under 15 min', 'Vegetarian', 0),

  (team_id,
   'Elote (Mexican Street Corn)',
   'Charred corn on the cob slathered in crema, cotija cheese, chilli powder, and lime - irresistible street food.',
   '4 corn cobs
3 tbsp mayonnaise or Mexican crema
1/2 cup cotija cheese (or feta), crumbled
1 tsp chilli powder
1/2 tsp smoked paprika
2 limes
Fresh coriander',
   'Grill corn directly on a gas flame or hot grill, turning often until charred all over
Brush immediately with mayonnaise or crema while hot
Press into crumbled cotija cheese to coat
Sprinkle with chilli powder and smoked paprika
Squeeze lime generously over each cob
Garnish with coriander and serve immediately',
   null, 'Mexican', 'Easy', '15-30 min', 'Vegetarian', 0),

  -- ======================================================
  -- CHINESE (6)
  -- ======================================================

  (team_id,
   'Egg Fried Rice',
   'Quick wok-tossed rice with scrambled eggs, spring onions, and soy sauce - a Chinese staple in 10 minutes.',
   '3 cups cooked jasmine rice (day-old is best)
3 eggs, beaten
3 tbsp light soy sauce
2 tbsp sesame oil
1 cup frozen peas
3 spring onions, sliced
2 garlic cloves, minced
2 tbsp vegetable oil',
   'Heat wok on maximum heat until smoking
Add oil, then garlic, stir-fry 30 seconds
Push garlic to the side and scramble eggs until just set
Add rice and break up all clumps, stir-fry 3 minutes
Add frozen peas and soy sauce, toss everything together
Drizzle sesame oil and top with spring onions',
   null, 'Chinese', 'Easy', 'Under 15 min', 'Vegetarian', 0),

  (team_id,
   'Kung Pao Chicken',
   'Fiery Sichuan classic with tender chicken, roasted peanuts, and dried chillies in a bold, numbing sauce.',
   '400g chicken breast, cubed
1/2 cup roasted peanuts
8 dried red chillies
3 tbsp soy sauce
2 tbsp rice vinegar
1 tbsp hoisin sauce
1 tsp cornstarch
2 tsp Sichuan peppercorns
3 spring onions, sliced',
   'Marinate chicken in soy sauce and cornstarch for 15 minutes
Mix remaining soy, vinegar, and hoisin into a sauce
Stir-fry chicken until cooked through, set aside
In the same wok, toast peppercorns and chillies until fragrant
Add spring onions, then return chicken, pour over sauce
Toss everything together and fold in peanuts last',
   null, 'Chinese', 'Medium', '15-30 min', 'Non-Vegetarian', 0),

  (team_id,
   'Vegetable Spring Rolls',
   'Crispy golden rolls filled with glass noodles, cabbage, carrots, and mushrooms - a dim sum classic.',
   '12 spring roll wrappers
100g glass noodles, soaked and drained
2 cups shredded cabbage
1 cup carrots, julienned
1 cup mushrooms, diced
2 tbsp soy sauce
1 tbsp sesame oil
Oil for deep frying',
   'Stir-fry cabbage, carrots, and mushrooms until just wilted
Add glass noodles, soy sauce, and sesame oil, toss and cool completely
Place 2 tablespoons filling on each wrapper, fold sides in and roll tightly
Seal edges with a flour-water paste
Deep fry in batches at 180 degrees C until deeply golden and crisp
Serve with sweet chilli sauce or soy dipping sauce',
   null, 'Chinese', 'Medium', '30-60 min', 'Vegan', 0),

  (team_id,
   'Gobi Manchurian',
   'Crispy cauliflower florets tossed in a tangy, spicy Sino-Indian sauce - a popular Indo-Chinese street dish.',
   '1 medium cauliflower, cut into florets
1/2 cup all-purpose flour
1/4 cup cornstarch
For sauce: 3 tbsp soy sauce, 2 tbsp tomato ketchup, 1 tbsp chilli sauce
1 onion, diced
3 garlic cloves, minced
2 green chillies
Spring onions to garnish
Oil for frying',
   'Make batter with flour, cornstarch, salt, and water; coat cauliflower
Deep fry cauliflower until golden and crispy, set aside
Saute onion, garlic, and green chilli in 2 tbsp oil
Add soy sauce, ketchup, and chilli sauce, stir to combine
Add 1/4 cup water and bring to a simmer
Toss fried cauliflower in sauce, garnish with spring onions',
   null, 'Chinese', 'Medium', '30-60 min', 'Vegan', 0),

  (team_id,
   'Chow Mein',
   'Classic stir-fried noodles with crisp vegetables, chicken, and a savoury soy and oyster sauce.',
   '300g egg noodles or lo mein noodles
200g chicken breast, sliced thin
2 cups cabbage, shredded
1 carrot, julienned
3 spring onions
3 tbsp soy sauce
1 tbsp oyster sauce
1 tbsp sesame oil',
   'Cook noodles per packet, drain and toss with sesame oil
Stir-fry chicken on high heat until golden, set aside
Stir-fry cabbage and carrot for 2 minutes until tender-crisp
Add cooked noodles and chicken back to the wok
Pour over soy sauce and oyster sauce, toss vigorously
Finish with spring onions and a drizzle of sesame oil',
   null, 'Chinese', 'Easy', '15-30 min', 'Non-Vegetarian', 0),

  (team_id,
   'Sweet and Sour Chicken',
   'Crispy battered chicken tossed in a glossy, tangy-sweet pineapple and bell pepper sauce.',
   '500g chicken breast, cubed
1/2 cup cornstarch
1 egg
For sauce: 3 tbsp rice vinegar, 3 tbsp ketchup, 2 tbsp sugar, 1 tbsp soy sauce
1 red and 1 green pepper, chunked
1 cup pineapple chunks
Oil for frying',
   'Coat chicken in beaten egg then cornstarch, deep fry at 180 degrees C until golden
Drain chicken on paper towel and set aside
Mix vinegar, ketchup, sugar, and soy sauce into a sauce
Stir-fry peppers for 2 minutes, add pineapple and sauce
Bring to a simmer until sauce thickens slightly
Toss fried chicken in the sauce and serve immediately over rice',
   null, 'Chinese', 'Medium', '30-60 min', 'Non-Vegetarian', 0),

  -- ======================================================
  -- THAI (5)
  -- ======================================================

  (team_id,
   'Pad Thai',
   'Thailand''s iconic noodle dish - rice noodles with egg, tamarind sauce, bean sprouts, and crushed peanuts.',
   '200g flat rice noodles
200g shrimp or firm tofu, cubed
2 eggs
3 tbsp tamarind paste
2 tbsp fish sauce (or soy)
1 tbsp palm or brown sugar
1 cup bean sprouts
3 spring onions
3 tbsp crushed roasted peanuts',
   'Soak rice noodles in warm water for 20 minutes, drain
Mix tamarind, fish sauce, and sugar into a sauce and set aside
Stir-fry protein on high heat until cooked, push to side
Scramble eggs in the same pan until just set
Add noodles and sauce, toss together 2 minutes
Add bean sprouts and spring onions, toss briefly and serve with peanuts',
   null, 'Thai', 'Medium', '30-60 min', 'Non-Vegetarian', 0),

  (team_id,
   'Thai Green Curry',
   'Fragrant coconut curry with green curry paste, vegetables, and Thai basil - aromatic and gently spicy.',
   '2 tbsp green curry paste
400ml coconut milk
300g chicken or firm tofu
1 zucchini, sliced
1 cup baby spinach
1 tbsp fish sauce (or soy)
1 tsp palm sugar
1 cup Thai basil leaves
Jasmine rice to serve',
   'Fry green curry paste in a splash of oil until very fragrant
Pour in coconut milk and stir to combine, bring to a simmer
Add protein and cook through - about 8 minutes for chicken
Add zucchini and spinach, simmer 3 more minutes
Season with fish sauce and palm sugar to balance
Stir in Thai basil, remove from heat, and serve over jasmine rice',
   null, 'Thai', 'Easy', '30-60 min', 'Non-Vegetarian', 0),

  (team_id,
   'Tom Yum Soup',
   'Hot and sour Thai soup with succulent shrimp, lemongrass, galangal, and kaffir lime leaves.',
   '400g shrimp, peeled
4 cups chicken or vegetable broth
2 stalks lemongrass, bruised and cut
4 slices galangal
4 kaffir lime leaves, torn
200g mushrooms, halved
3 tbsp fish sauce
2 tbsp fresh lime juice
Fresh red chilli and coriander to finish',
   'Bring broth to a boil with lemongrass, galangal, and lime leaves
Simmer 5 minutes to fully infuse the aromatics
Add mushrooms and cook 3 minutes
Add shrimp and cook until pink - about 2-3 minutes
Season with fish sauce and lime juice, taste and adjust
Serve topped with sliced red chilli and fresh coriander',
   null, 'Thai', 'Easy', '15-30 min', 'Non-Vegetarian', 0),

  (team_id,
   'Thai Basil Fried Rice',
   'Quick, fragrant fried rice with holy basil, garlic, chilli, and a runny fried egg - a Thai street food favourite.',
   '3 cups cooked jasmine rice (day-old)
2 eggs
3 tbsp fish sauce
1 tbsp oyster sauce
1 tbsp sugar
4 garlic cloves, minced
3 Thai bird''s eye chillies, sliced
1 cup Thai basil leaves
2 spring onions',
   'Heat wok on maximum heat, add oil and fry garlic and chilli 30 seconds
Push to side, fry eggs sunny-side up in the same wok, set aside
Add rice and break up clumps, stir-fry 2 minutes
Add fish sauce, oyster sauce, and sugar, toss everything together
Fold in Thai basil and spring onions, cook just until wilted
Serve topped with the fried egg',
   null, 'Thai', 'Easy', 'Under 15 min', 'Non-Vegetarian', 0),

  (team_id,
   'Mango Sticky Rice',
   'Sweet glutinous rice bathed in coconut cream, served with fresh sliced mango - Thailand''s most loved dessert.',
   '2 cups glutinous sticky rice
400ml coconut milk
3 tbsp sugar
1/2 tsp salt
2 ripe mangoes, sliced
1 tbsp toasted sesame seeds (optional)',
   'Soak glutinous rice overnight in cold water, then drain
Steam rice for 25-30 minutes until translucent and tender
Warm coconut milk with sugar and salt until sugar dissolves
Pour 3/4 of the coconut cream over hot rice and let it absorb 15 minutes
Slice mangoes and arrange beside the rice
Drizzle remaining coconut cream over the rice and garnish with sesame seeds',
   null, 'Thai', 'Medium', '30-60 min', 'Vegan', 0),

  -- ======================================================
  -- AMERICAN (7)
  -- ======================================================

  (team_id,
   'Mac and Cheese',
   'The ultimate stovetop mac and cheese with a cheddar and gruyere bechamel sauce - rich, creamy, and nostalgic.',
   '250g macaroni
2 tbsp butter
2 tbsp all-purpose flour
2 cups whole milk
1 cup sharp cheddar, grated
1/2 cup gruyere, grated
1/2 tsp mustard powder
Salt and pepper',
   'Cook macaroni in salted water until al dente, drain and set aside
Melt butter in a saucepan, whisk in flour and cook 1 minute
Gradually whisk in milk over medium heat until thick and smooth
Remove from heat and melt in both cheeses
Season with mustard powder, salt, and pepper
Fold macaroni into the cheese sauce and serve hot',
   null, 'American', 'Easy', '30-60 min', 'Vegetarian', 0),

  (team_id,
   'Grilled Cheese Sandwich',
   'Perfectly golden, buttery toasted sourdough with melted cheddar and gruyere - the ultimate 10-minute comfort food.',
   '2 thick slices sourdough bread
3 slices sharp cheddar
2 slices gruyere
2 tbsp softened unsalted butter
1 tsp Dijon mustard (optional)',
   'Spread softened butter generously on the outside of both bread slices
Spread Dijon on the inside of one slice if using
Layer cheddar and gruyere on the non-buttered side
Close sandwich, buttered sides facing out
Place in a cold non-stick pan over medium-low heat
Cook 4-5 minutes per side until deeply golden and cheese is fully melted',
   null, 'American', 'Easy', 'Under 15 min', 'Vegetarian', 0),

  (team_id,
   'Fluffy Buttermilk Pancakes',
   'Thick, cloud-like pancakes with crispy edges and a melt-in-your-mouth interior - best with maple syrup.',
   '2 cups all-purpose flour
2 tbsp sugar
1 tsp baking powder
1 tsp baking soda
2 large eggs
1.5 cups buttermilk
3 tbsp melted butter
Maple syrup and extra butter to serve',
   'Whisk together flour, sugar, baking powder, baking soda, and a pinch of salt
Beat eggs with buttermilk and melted butter in another bowl
Fold wet ingredients into dry until just combined - lumps are fine, do not overmix
Let batter rest 5 minutes
Cook spoonfuls on a medium-low buttered non-stick pan for 2-3 minutes until bubbles form
Flip once and cook 1 minute more',
   null, 'American', 'Easy', '15-30 min', 'Vegetarian', 0),

  (team_id,
   'Caesar Salad',
   'Classic Caesar with crisp romaine, house-made Caesar dressing, Parmesan shards, and golden croutons.',
   '2 romaine lettuces, chopped
50g parmesan, shaved
For dressing: 1 garlic clove, 2 anchovy fillets, 1 egg yolk, 2 tbsp lemon juice, 1 tsp Worcestershire sauce, 1/2 cup olive oil
For croutons: 2 slices sourdough, olive oil, salt',
   'Make croutons: cube bread, toss in oil and salt, bake at 200 degrees C for 10 minutes until golden
Make dressing: blend garlic, anchovies, and egg yolk, slowly whisk in olive oil to emulsify
Add lemon juice, Worcestershire sauce, and season to taste
Toss romaine in dressing until well coated
Pile onto plates, scatter Parmesan shards and croutons generously',
   null, 'American', 'Medium', '15-30 min', 'Non-Vegetarian', 0),

  (team_id,
   'Buffalo Wings',
   'Crispy baked chicken wings tossed in fiery butter-hot sauce - sticky, spicy, and impossible to stop eating.',
   '1kg chicken wings, split at joint
3 tbsp baking powder (for extra crispiness)
1 tsp salt
1/2 cup hot sauce (like Frank''s RedHot)
3 tbsp unsalted butter, melted
Blue cheese dip and celery to serve',
   'Toss wings in baking powder and salt, place on a wire rack
Refrigerate uncovered for at least 1 hour or overnight to dry the skin
Bake at 220 degrees C for 40-45 minutes, flipping halfway, until very crispy
Make buffalo sauce: whisk hot sauce into melted butter
Toss hot wings in buffalo sauce to coat
Serve immediately with blue cheese dip and celery sticks',
   null, 'American', 'Medium', '30-60 min', 'Non-Vegetarian', 0),

  (team_id,
   'BBQ Smash Burger',
   'A juicy double smash burger with a crispy sear, melted American cheese, and tangy BBQ sauce on a brioche bun.',
   '500g 80/20 ground beef
4 slices American cheese
2 brioche buns
2 tbsp BBQ sauce
Lettuce, tomato, and pickles
Salt and pepper',
   'Divide beef into 4 equal balls, season generously with salt and pepper
Heat cast iron pan until smoking hot with a thin layer of oil
Add 2 balls at a time and immediately smash flat with a spatula
Cook 2-3 minutes until edges are crispy, flip and add cheese
Toast brioche buns in the same pan
Build burger: bun, BBQ sauce, pickles, lettuce, tomato, double patty',
   null, 'American', 'Easy', '15-30 min', 'Non-Vegetarian', 0),

  (team_id,
   'Chocolate Chip Cookies',
   'Thick, chewy bakery-style cookies with crispy edges, puddles of melted dark chocolate, and a hint of sea salt.',
   '225g unsalted butter, browned and cooled
200g brown sugar
100g caster sugar
2 large eggs + 1 yolk
2 tsp vanilla extract
300g all-purpose flour
1 tsp baking soda
1/2 tsp salt
300g dark chocolate chips or chopped chocolate
Flaky sea salt for topping',
   'Brown butter in a saucepan until nutty and amber, pour into bowl and cool 10 minutes
Whisk in both sugars until combined, then beat in eggs, yolk, and vanilla
Fold in flour, baking soda, and salt until just combined
Fold in chocolate chips - do not overmix
Scoop large balls onto lined trays, refrigerate 30 minutes
Bake at 180 degrees C for 11-12 minutes until golden at edges but soft in centre
Immediately sprinkle with flaky salt',
   null, 'American', 'Medium', '30-60 min', 'Vegetarian', 0),

  -- ======================================================
  -- JAPANESE (5)
  -- ======================================================

  (team_id,
   'Miso Soup',
   'Simple, warming Japanese miso soup with silken tofu, wakame seaweed, and spring onions - ready in 10 minutes.',
   '4 cups dashi stock (or vegetable stock)
3 tbsp white miso paste
150g silken tofu, cubed
2 tbsp dried wakame seaweed
2 spring onions, sliced thin',
   'Soak wakame in cold water for 5 minutes until rehydrated, drain
Heat dashi stock until just below a boil
Dissolve miso paste in a ladle of warm stock, then stir back into pot
Do not boil after adding miso - it loses flavour
Add tofu and wakame, warm for 1 minute
Ladle into bowls and top with spring onions',
   null, 'Japanese', 'Easy', 'Under 15 min', 'Vegan', 0),

  (team_id,
   'Teriyaki Chicken',
   'Juicy chicken thighs with crispy skin lacquered in a sweet and savoury homemade teriyaki glaze.',
   '4 chicken thighs, boneless and skin-on
3 tbsp soy sauce
2 tbsp mirin
1 tbsp sake
1 tbsp honey
1 tsp sesame oil
Sesame seeds and spring onions to garnish
Steamed rice to serve',
   'Mix soy sauce, mirin, sake, and honey in a small bowl
Score the chicken skin and pat completely dry
Pan-sear skin-side down for 7 minutes until deeply golden and crispy
Flip and cook 5 more minutes until cooked through
Pour sauce over chicken and cook, spooning constantly, until thick and glossy
Rest 2 minutes, slice, and serve over rice with sesame seeds and spring onions',
   null, 'Japanese', 'Easy', '15-30 min', 'Non-Vegetarian', 0),

  (team_id,
   'Spicy Tuna Sushi Roll',
   'Inside-out sushi roll with spicy tuna, cucumber, and avocado - fresh, vibrant, and better than takeout.',
   '2 cups sushi rice, cooked and seasoned with rice vinegar
200g sushi-grade tuna, diced
2 tbsp sriracha mayonnaise
4 sheets nori
1 avocado, sliced thin
1/2 cucumber, julienned
Soy sauce, pickled ginger, and wasabi to serve',
   'Mix diced tuna with sriracha mayo and season with soy sauce
Place a nori sheet on a bamboo mat, shiny side down
Spread sushi rice in an even layer leaving a 2cm border
Flip - rice side down - onto a damp surface
Place tuna, avocado, and cucumber along the nori
Roll tightly using the mat, seal with a damp finger
Slice into 8 pieces with a sharp wet knife',
   null, 'Japanese', 'Hard', '30-60 min', 'Non-Vegetarian', 0),

  (team_id,
   'Tonkotsu Ramen',
   'Rich, creamy pork bone broth with springy noodles, chashu pork belly, soft-boiled egg, and nori.',
   '4 cups tonkotsu or chicken broth
200g fresh ramen noodles
2 soft-boiled eggs, halved
150g chashu pork belly, sliced
2 sheets nori
2 spring onions, sliced
1 tbsp white sesame seeds
2 tbsp tare (seasoning sauce: 3 tbsp soy, 1 tbsp mirin, 1 tsp sugar)',
   'Warm broth and stir in tare to season to taste
Cook ramen noodles per packet, drain well
Warm chashu pork slices in a hot pan briefly
Ladle broth into deep bowls
Add noodles and arrange toppings: pork, halved egg, nori, spring onions
Finish with sesame seeds and a drizzle of chilli oil if desired',
   null, 'Japanese', 'Medium', '30-60 min', 'Non-Vegetarian', 0),

  (team_id,
   'Gyoza (Pan-Fried Dumplings)',
   'Crispy-bottomed Japanese dumplings with a juicy pork and cabbage filling - the perfect appetiser.',
   '30 gyoza wrappers
250g ground pork
1 cup napa cabbage, finely chopped and salted
2 spring onions, minced
1 tbsp soy sauce
1 tbsp sesame oil
1 tsp grated ginger
1 garlic clove, grated
For dipping: 3 tbsp soy sauce, 1 tbsp rice vinegar',
   'Squeeze all moisture from salted cabbage using a cloth
Mix pork, cabbage, spring onions, soy, sesame oil, ginger, and garlic
Place a teaspoon of filling in centre of each wrapper
Fold and pleat edges to seal into a half-moon shape
Heat oil in a non-stick pan, add gyoza flat-side down
Cook 2 minutes until golden, add 1/4 cup water, cover immediately
Steam 3 minutes until water evaporates, uncover to crisp base',
   null, 'Japanese', 'Hard', '30-60 min', 'Non-Vegetarian', 0);

END $$;
