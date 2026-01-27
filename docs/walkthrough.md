# After Effects MCP Server - Setup Complete

## Summary
After Effects MCP Serverのセットアップが完了しました。AIからAfter Effectsを直接操作できるようになります。

## Installed Components

| Component | Path |
|-----------|------|
| Go Runtime | `/opt/homebrew/Cellar/go/1.25.6` |
| AE MCP Server | `/Users/takahashikenta/projects/remotion-video/ae-mcp/ae-mcp` |
| ExtendScript | `/Users/takahashikenta/projects/remotion-video/ae-mcp/js/ae-mcp.jsx` |

## Configuration for Claude Desktop / Cursor

Add this to your MCP configuration:

```json
{
  "mcpServers": {
    "aftereffects": {
      "command": "/Users/takahashikenta/projects/remotion-video/ae-mcp/ae-mcp",
      "args": []
    }
  }
}
```

**For Cursor**: Settings > MCP > Add Server

## Initial Setup in After Effects

1. After Effectsを起動
2. File > Scripts > Run Script File...
3. `ae-mcp/js/ae-mcp.jsx` を選択して実行

## Example Commands

After configuration, you can ask:
- 「AEで新しい1920x1080のコンポを作って」
- 「テキストレイヤーを追加して」
- 「ガウスブラーエフェクトを適用して」
- 「キーフレームを追加してアニメーションさせて」
