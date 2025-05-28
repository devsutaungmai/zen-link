# ZenLink Environment Setup Script
# This script helps set up environment variables for different deployment environments

echo "🚀 ZenLink Environment Setup"
echo "=================================="

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "Error: Please run this script from the project root directory"
    exit 1
fi

echo "📋 Available environment templates:"
echo "1. Local Development (.env)"
echo "2. Production Environment (.env.production)"
echo "3. Development/Staging Environment (.env.development)"
echo ""

read -p "Which environment would you like to set up? (1-3): " choice

case $choice in
    1)
        echo "🔧 Setting up local development environment..."
        if [ -f ".env" ]; then
            echo "env file already exists. Backup created as .env.backup"
            cp .env .env.backup
        fi
        cp .env.development.example .env
        echo "Local .env file created. Please update with your local database credentials."
        ;;
    2)
        echo "Production environment template ready."
        echo "Copy variables from .env.production.example to your Vercel project settings."
        echo "Set these for the 'Production' environment (main branch)."
        ;;
    3)
        echo "Development environment template ready."
        echo "Copy variables from .env.development.example to your Vercel project settings."
        echo "Set these for the 'Preview' environment (dev branch)."
        ;;
    *)
        echo "Invalid choice. Please run the script again."
        exit 1
        ;;
esac

echo ""
echo " Important reminders:"
echo "• Generate a secure JWT_SECRET for production"
echo "• Set up separate databases for each environment"
echo "• Configure your domain DNS to point to Vercel"
echo "• Run database migrations after deployment"
echo ""
echo " For detailed setup instructions, see DEPLOYMENT.md"
