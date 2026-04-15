from mcp.server.fastmcp import FastMCP

# Creating the mcp server
mcp = FastMCP("basic-server")

@mcp.tool()
def add(a: int, b:int) -> int:
    """Adding two numbers"""
    return a + b

@mcp.tool()
def multiply(a: int, b: int) -> int:
    """Multiplying two numbers"""
    return a * b

@mcp.resource("notes://welcome")
def welcome_note():
    return "This is the first MCP resource"

@mcp.prompt()
def research_assistant(topics: list[str]) -> list[str]:
    return [f"Researching: {topic}" for topic in topics]

if __name__ == "__main__":
    mcp.run()
