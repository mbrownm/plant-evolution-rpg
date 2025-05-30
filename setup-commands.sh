# First, let's create your repository structure
mkdir plant-evolution-rpg
cd plant-evolution-rpg

# Initialize git
git init
git branch -M main

# Create basic folder structure
mkdir client server assets
mkdir client/{js,css,images} server/{models,routes,controllers}
mkdir assets/{plants,ui,sounds}