# Cron Expression Parser

Hey there! This is a simple command-line tool I built to parse cron expressions. It takes a cron string and breaks it down to show you exactly when your scheduled job will run. Pretty handy for debugging those pesky cron schedules!

## What does it do?

Give it a cron expression like `*/15 0 1,15 * 1-5 /usr/bin/find` and it'll tell you:
- Which minutes it runs (0, 15, 30, 45)
- Which hours (0)
- Which days of the month (1st and 15th)
- Which months (all of them)
- Which days of the week (Monday through Friday)
- And what command it executes

The parser understands standard 5-field cron format:
- **Minute** - 0 to 59
- **Hour** - 0 to 23  
- **Day of Month** - 1 to 31
- **Month** - 1 to 12
- **Day of Week** - 0 to 6 (Sunday is 0)

Plus the command you want to run.

## What it supports

I implemented all the standard cron syntax:
- `*` - runs at every value
- `5` - runs at a specific value
- `1-5` - runs for a range of values
- `1,3,5` - runs at specific values from a list
- `*/15` - runs every 15 units (minutes, hours, etc.)
- `10-30/5` - runs every 5 units within a range

The output is formatted as a clean table that's easy to read.

## Getting Started

### What you need

Just Node.js installed on your system. I tested it with Node.js v12 and up, but any recent version should work fine.

### Setup

There's no complicated setup - just grab the files and you're good to go!

#### On Linux or Mac:

```bash
# Navigate to the project directory
cd /path/to/cron

# Optional: make the script executable
chmod +x cron-parser.js

# Run it
node cron-parser.js "*/15 0 1,15 * 1-5 /usr/bin/find"

# Or if you made it executable
./cron-parser.js "*/15 0 1,15 * 1-5 /usr/bin/find"
```

#### On Windows:

```powershell
# Navigate to the project directory
cd C:\path\to\cron

# Run it
node cron-parser.js "*/15 0 1,15 * 1-5 /usr/bin/find"
```

**Important:** Always wrap your cron expression in quotes! Otherwise your shell will interpret the special characters.

## How to use it

### Basic usage

```bash
node cron-parser.js "<your_cron_expression>"
```

### Real examples

Let's say you want to run a backup script every 15 minutes:
```bash
node cron-parser.js "*/15 * * * * /usr/bin/backup.sh"
```

You'll see:
```
minute        0 15 30 45
hour          0 1 2 3 4 5 6 7 8 9 10 11 12 13 14 15 16 17 18 19 20 21 22 23
day of month  1 2 3 4 5 6 7 8 9 10 11 12 13 14 15 16 17 18 19 20 21 22 23 24 25 26 27 28 29 30 31
month         1 2 3 4 5 6 7 8 9 10 11 12
day of week   0 1 2 3 4 5 6 7
command       /usr/bin/backup.sh
```

Or maybe you want something to run at 2:30 PM on the 1st and 15th:
```bash
node cron-parser.js "30 14 1,15 * * /home/user/reports.sh"
```

Output:
```
minute        30
hour          14
day of month  1 15
month         1 2 3 4 5 6 7 8 9 10 11 12
day of week   0 1 2 3 4 5 6
command       /home/user/reports.sh
```

How about during business hours on weekdays?
```bash
node cron-parser.js "*/5 9-17 * * 1-5 /usr/bin/task"
```

This runs every 5 minutes from 9 AM to 5 PM, Monday through Friday.


## Project Files

Here's what's in the project:

```
cron_parser/
├── cron-parser.js       # The main parser
├── README.md            # You're reading it!
```

## How it works under the hood

The parser is pretty straightforward - it's written in vanilla JavaScript with no dependencies:

- **parseField()** - Takes a single field from the cron expression and expands it into all the actual values. For example, `*/15` in the minute field becomes `[0, 15, 30, 45]`.

- **parseCron()** - Breaks apart the full cron string into its 5 time fields and command, then calls parseField() on each time component.

- **formatOutput()** - Takes all those expanded values and formats them into that nice table you see.

The code includes a ton of validation too - it'll catch invalid ranges, out-of-bounds values, malformed expressions, and give you helpful error messages.

## Common errors you might see

If you mess something up, the parser will let you know:

```bash
# Forgot to quote the expression
$ node cron-parser.js */15 0 * * * /usr/bin/find
Error: Too many arguments. Cron expression must be quoted as a single argument.

# Value out of range
$ node cron-parser.js "60 * * * * /usr/bin/test"
Error: Value 60 in minute is out of range (0-59)

# Invalid range
$ node cron-parser.js "10-5 * * * * /usr/bin/test"  
Error: Invalid minute: range start (10) is greater than end (5)

# Bad step value
$ node cron-parser.js "*/0 * * * * /usr/bin/test"
Error: Invalid minute: step value must be a positive number

# Not enough fields
$ node cron-parser.js "0 0 * *"
Error: Invalid cron expression: must have 5 time fields and a command
```

## What it doesn't support

This is a focused implementation of standard cron, so I didn't include:
- Special strings like `@yearly`, `@monthly`, `@daily`, etc.
- Non-standard cron extensions
- The 6th field (seconds) some systems use
- Year field (7-field cron)

These are easy to add, but the requirements said to keep it simple and stick to the standard 5-field format.

## Running on different systems

### Linux (Ubuntu, Debian, Fedora, etc.)

```bash
# Make sure Node.js is installed
node --version

# If not installed, use your package manager
sudo apt install nodejs  # Ubuntu/Debian
sudo dnf install nodejs  # Fedora

# Navigate to the project and run
cd /path/to/cron
node cron-parser.js "*/15 0 1,15 * 1-5 /usr/bin/find"
```

### macOS

```bash
# Check if Node.js is installed
node --version

# If not, install via Homebrew
brew install node

# Run the parser
cd /path/to/cron
node cron-parser.js "*/15 0 1,15 * 1-5 /usr/bin/find"
```

### Windows

```powershell
# Check if Node.js is installed
node --version

# If not, download from nodejs.org

# Navigate and run
cd C:\path\to\cron
node cron-parser.js "*/15 0 1,15 * 1-5 /usr/bin/find"
```

### Using Git Bash on Windows

```bash
# Works just like Linux
cd /c/path/to/cron
node cron-parser.js "*/15 0 1,15 * 1-5 /usr/bin/find"
```

## Tips for new team members

If you're taking over this project, here's what you should know:

1. **The code is well-commented** - I tried to explain the logic as I went, especially for the trickier parts.

2. **Tests are your friend** - Before making changes, run the tests. After making changes, run them again. If they pass, you're probably good.

3. **Start simple** - If you need to add a feature, start with the parseField() function. That's where most of the magic happens.

4. **Check VALIDATION.md** - I documented all the edge cases and error handling there. It's helpful for understanding what can go wrong.

5. **No dependencies = simple deployment** - You can just copy these files anywhere that has Node.js and it'll work. No npm install needed.

## Quick troubleshooting

**Script won't run:**
- Make sure Node.js is installed: `node --version`
- Check you're in the right directory
- Verify the file exists: `ls -l cron-parser.js` (Linux/Mac) or `dir cron-parser.js` (Windows)

**Getting weird errors:**
- Are you quoting the cron expression? The quotes are important!
- Check that your cron expression has exactly 5 time fields plus a command
- Make sure values are in the valid ranges (see the error message)

**Tests are failing:**
- Did you modify the code? Run through what changed
- Try running a simple expression manually to isolate the issue
- Check that you haven't accidentally edited the test file

## Contributing

This was built as a technical exercise, but if you want to extend it:
- Keep it simple - that was the original goal
- Add tests for any new features
- Update this README if you change how it works
- Consider whether your feature belongs in "standard cron" or is an extension

## License

This is a technical assessment project - use it however you need to!
