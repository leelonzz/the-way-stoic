#!/bin/bash

# Cursor Profile Launcher for macOS
# Allows running multiple Cursor instances with isolated profiles

echo "=== Cursor Profile Launcher ==="
echo "This utility allows you to run multiple Cursor instances"
echo ""

# Function to create a new profile
create_profile() {
    local profile_name=$1
    local project_dir=$2
    local memory_limit=${3:-16}
    
    # Create user data directory for this profile
    local user_data_dir="$HOME/.cursor-profiles/$profile_name"
    mkdir -p "$user_data_dir"
    
    # Build the Cursor command
    local cursor_cmd="cursor"
    if [ -n "$project_dir" ]; then
        cursor_cmd="$cursor_cmd \"$project_dir\""
    fi
    cursor_cmd="$cursor_cmd --user-data-dir=\"$user_data_dir\""
    
    # Add memory limit if specified
    if [ "$memory_limit" != "16" ]; then
        cursor_cmd="$cursor_cmd --max-memory=$memory_limit"
    fi
    
    echo "Launching Cursor with profile: $profile_name"
    echo "User data directory: $user_data_dir"
    echo "Command: $cursor_cmd"
    echo ""
    
    # Launch Cursor in background
    eval "$cursor_cmd" &
}

# Main menu
echo "Choose an option:"
echo "1. Use Profile 1"
echo "2. Use Profile 2" 
echo "3. Use Profile 3"
echo "4. Use Profile 4"
echo "5. Create custom profile"
echo "6. Exit"
echo ""

read -p "Enter your choice (1-6): " choice

case $choice in
    1|2|3|4)
        profile_name="profile$choice"
        read -p "Enter project directory (optional, press Enter to skip): " project_dir
        read -p "Enter memory limit in GB (default 16): " memory_limit
        memory_limit=${memory_limit:-16}
        create_profile "$profile_name" "$project_dir" "$memory_limit"
        ;;
    5)
        read -p "Enter custom profile name: " profile_name
        read -p "Enter project directory (optional, press Enter to skip): " project_dir
        read -p "Enter memory limit in GB (default 16): " memory_limit
        memory_limit=${memory_limit:-16}
        create_profile "$profile_name" "$project_dir" "$memory_limit"
        ;;
    6)
        echo "Exiting..."
        exit 0
        ;;
    *)
        echo "Invalid choice. Please run the script again."
        exit 1
        ;;
esac

echo "Cursor launched successfully!"
echo "You can now run this script again to launch additional instances." 