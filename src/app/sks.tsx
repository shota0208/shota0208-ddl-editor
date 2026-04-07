"use client";

import { useState } from "react";

export default function HomePage() {
  const [tables, setTables] = useState([
    {
      name: "users",
      columns: [
        {
          name: "id",
          type: "INT",
          notNull: true,
          primaryKey: true,
          unique: true,
          check: "",
          default: "",
          foreignKey: { table: "", column: "" },
        },
        {
          name: "age",
          type: "INT",
          notNull: false,
          primaryKey: false,
          unique: false,
          check: "age >= 0",
          default: "0",
          foreignKey: { table: "", column: "" },
        },
      ],
    },
  ]);

  const [generatedSQL, setGeneratedSQL] = useState("");

  // -----------------------------
  // SQL 生成（フォーマット済み）
  // -----------------------------
  const generateSQL = () => {
    let sql = "";

    tables.forEach((table) => {
      sql += `CREATE TABLE ${table.name} (\n`;

      const lines: string[] = [];

      // カラム定義
      table.columns.forEach((col) => {
        let line = `  ${col.name} ${col.type}`;

        if (col.notNull) line += " NOT NULL";
        if (col.unique) line += " UNIQUE";
        if (col.primaryKey) line += " PRIMARY KEY";
        if (col.default !== "") line += ` DEFAULT ${col.default}`;
        if (col.check !== "") line += ` CHECK (${col.check})`;

        lines.push(line);
      });

      // 外部キー
      table.columns
        .filter((col) => col.foreignKey.table && col.foreignKey.column)
        .forEach((col) => {
          lines.push(
            `  FOREIGN KEY (${col.name}) REFERENCES ${col.foreignKey.table}(${col.foreignKey.column})`
          );
        });

      sql += lines.join(",\n");
      sql += `\n);\n\n`;
    });

    setGeneratedSQL(sql);
  };

  // -----------------------------
  // SQL ダウンロード
  // -----------------------------
  const downloadSQL = () => {
    const blob = new Blob([generatedSQL], { type: "text/sql" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = "schema.sql";
    a.click();

    URL.revokeObjectURL(url);
  };

  // -----------------------------
  // JSON 保存（エクスポート）
  // -----------------------------
  const exportJSON = () => {
    const json = JSON.stringify(tables, null, 2);
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = "schema.json";
    a.click();

    URL.revokeObjectURL(url);
  };

  // -----------------------------
  // JSON 読み込み（インポート）
  // -----------------------------
  const importJSON = (file: File) => {
  const reader = new FileReader();

  reader.onload = (e: ProgressEvent<FileReader>) => {
    const text = e.target?.result as string | null;
    if (!text) return; // null の場合はここで終了

    const data = JSON.parse(text);
    setTables(data);
  };

  reader.readAsText(file);
};


  // -----------------------------
  // テーブル操作
  // -----------------------------
  const addTable = () => {
    const newTable = {
      name: `table_${tables.length + 1}`,
      columns: [
        {
          name: "id",
          type: "INT",
          notNull: false,
          primaryKey: false,
          unique: false,
          check: "",
          default: "",
          foreignKey: { table: "", column: "" },
        },
      ],
    };
    setTables([...tables, newTable]);
  };

  const updateTableName = (index, newName) => {
    const updated = [...tables];
    updated[index].name = newName;
    setTables(updated);
  };

  const deleteTable = (index) => {
    setTables(tables.filter((_, i) => i !== index));
  };

  // -----------------------------
  // カラム操作
  // -----------------------------
  const addColumn = (tableIndex) => {
    const updated = [...tables];
    const colCount = updated[tableIndex].columns.length;
    updated[tableIndex].columns.push({
      name: `column_${colCount + 1}`,
      type: "VARCHAR",
      notNull: false,
      primaryKey: false,
      unique: false,
      check: "",
      default: "",
      foreignKey: { table: "", column: "" },
    });
    setTables(updated);
  };

  const updateColumnName = (tableIndex, columnIndex, newName) => {
    const updated = [...tables];
    updated[tableIndex].columns[columnIndex].name = newName;
    setTables(updated);
  };

  const updateColumnType = (tableIndex, columnIndex, newType) => {
    const updated = [...tables];
    updated[tableIndex].columns[columnIndex].type = newType;
    setTables(updated);
  };

  const updateConstraint = (tableIndex, columnIndex, key, value) => {
    const updated = [...tables];
    updated[tableIndex].columns[columnIndex][key] = value;
    setTables(updated);
  };

  const updateCheck = (tableIndex, columnIndex, value) => {
    const updated = [...tables];
    updated[tableIndex].columns[columnIndex].check = value;
    setTables(updated);
  };

  const updateDefault = (tableIndex, columnIndex, value) => {
    const updated = [...tables];
    updated[tableIndex].columns[columnIndex].default = value;
    setTables(updated);
  };

  const updateForeignKey = (tableIndex, columnIndex, key, value) => {
    const updated = [...tables];
    updated[tableIndex].columns[columnIndex].foreignKey[key] = value;
    setTables(updated);
  };

  const deleteColumn = (tableIndex, columnIndex) => {
    const updated = [...tables];
    updated[tableIndex].columns = updated[tableIndex].columns.filter(
      (_, i) => i !== columnIndex
    );
    setTables(updated);
  };

  // -----------------------------
  // UI
  // -----------------------------
  return (
    <main style={{ padding: 24 }}>
      <h1>テーブル一覧</h1>

      <button onClick={addTable}>テーブルを追加</button>

      <button
        onClick={generateSQL}
        style={{ marginLeft: 16, background: "blue", color: "white" }}
      >
        SQL を生成
      </button>

      <button
        onClick={downloadSQL}
        style={{ marginLeft: 16, background: "purple", color: "white" }}
      >
        SQL をダウンロード
      </button>

      <button
        onClick={exportJSON}
        style={{ marginLeft: 16, background: "orange", color: "white" }}
      >
        JSON を保存
      </button>

      <input
        type="file"
        accept="application/json"
        onChange={(e) => {
          if (e.target.files && e.target.files.length > 0) {
            importJSON(e.target.files[0]);
          }
        }}
        style={{ marginLeft: 16 }}
      />

      <pre
        style={{
          background: "#222",
          color: "#0f0",
          padding: 16,
          marginTop: 16,
          whiteSpace: "pre-wrap",
        }}
      >
        {generatedSQL}
      </pre>

      <ul>
        {tables.map((table, tableIndex) => (
          <li key={tableIndex} style={{ marginBottom: 16 }}>
            {/* テーブル名 */}
            <input
              type="text"
              value={table.name}
              onChange={(e) => updateTableName(tableIndex, e.target.value)}
              style={{ padding: 4, marginRight: 8 }}
            />

            <button
              onClick={() => deleteTable(tableIndex)}
              style={{ background: "red", color: "white" }}
            >
              削除
            </button>

            <button
              onClick={() => addColumn(tableIndex)}
              style={{ marginLeft: 8, background: "green", color: "white" }}
            >
              カラムを追加
            </button>

            <ul>
              {table.columns.map((col, colIndex) => (
                <li key={colIndex} style={{ marginTop: 8 }}>
                  {/* カラム名 */}
                  <input
                    type="text"
                    value={col.name}
                    onChange={(e) =>
                      updateColumnName(tableIndex, colIndex, e.target.value)
                    }
                    style={{ padding: 4, marginRight: 8 }}
                  />

                  {/* 型 */}
                  <select
                    value={col.type}
                    onChange={(e) =>
                      updateColumnType(tableIndex, colIndex, e.target.value)
                    }
                    style={{ padding: 4, marginRight: 8 }}
                  >
                    <option value="INT">INT</option>
                    <option value="VARCHAR">VARCHAR</option>
                    <option value="TEXT">TEXT</option>
                    <option value="DATE">DATE</option>
                    <option value="BOOLEAN">BOOLEAN</option>
                  </select>

                  {/* 制約 */}
                  <label style={{ marginRight: 8 }}>
                    <input
                      type="checkbox"
                      checked={col.notNull}
                      onChange={(e) =>
                        updateConstraint(
                          tableIndex,
                          colIndex,
                          "notNull",
                          e.target.checked
                        )
                      }
                    />
                    NOT NULL
                  </label>

                  <label style={{ marginRight: 8 }}>
                    <input
                      type="checkbox"
                      checked={col.primaryKey}
                      onChange={(e) =>
                        updateConstraint(
                          tableIndex,
                          colIndex,
                          "primaryKey",
                          e.target.checked
                        )
                      }
                    />
                    PK
                  </label>

                  <label style={{ marginRight: 8 }}>
                    <input
                      type="checkbox"
                      checked={col.unique}
                      onChange={(e) =>
                        updateConstraint(
                          tableIndex,
                          colIndex,
                          "unique",
                          e.target.checked
                        )
                      }
                    />
                    UNIQUE
                  </label>

                  {/* CHECK */}
                  <input
                    type="text"
                    placeholder="CHECK 条件"
                    value={col.check}
                    onChange={(e) =>
                      updateCheck(tableIndex, colIndex, e.target.value)
                    }
                    style={{ padding: 4, marginRight: 8, width: 150 }}
                  />

                  {/* DEFAULT */}
                  <input
                    type="text"
                    placeholder="DEFAULT 値"
                    value={col.default}
                    onChange={(e) =>
                      updateDefault(tableIndex, colIndex, e.target.value)
                    }
                    style={{ padding: 4, marginRight: 8, width: 120 }}
                  />

                  {/* 外部キー：参照テーブル */}
                  <select
                    value={col.foreignKey.table}
                    onChange={(e) =>
                      updateForeignKey(
                        tableIndex,
                        colIndex,
                        "table",
                        e.target.value
                      )
                    }
                    style={{ marginRight: 8 }}
                  >
                    <option value="">参照テーブル</option>
                    {tables.map((t, i) => (
                      <option key={i} value={t.name}>
                        {t.name}
                      </option>
                    ))}
                  </select>

                  {/* 外部キー：参照カラム */}
                  <select
                    value={col.foreignKey.column}
                    onChange={(e) =>
                      updateForeignKey(
                        tableIndex,
                        colIndex,
                        "column",
                        e.target.value
                      )
                    }
                    style={{ marginRight: 8 }}
                  >
                    <option value="">参照カラム</option>
                    {tables
                      .find((t) => t.name === col.foreignKey.table)
                      ?.columns.map((c, i) => (
                        <option key={i} value={c.name}>
                          {c.name}
                        </option>
                      ))}
                  </select>

                  {/* カラム削除 */}
                  <button
                    onClick={() => deleteColumn(tableIndex, colIndex)}
                    style={{ background: "orange", color: "white" }}
                  >
                    削除
                  </button>
                </li>
              ))}
            </ul>
          </li>
        ))}
      </ul>
    </main>
  );
}
