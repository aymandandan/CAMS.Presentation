import React, { useState, useCallback, useRef } from "react";
import {
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Paper,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";

interface SpecEntry {
  id: string; // stable unique identifier
  key: string;
  value: string;
}

interface SpecificationsEditorProps {
  value: Record<string, string> | undefined; // initial value (uncontrolled)
  onChange: (specs: Record<string, string>) => void;
}

const generateId = () =>
  crypto.randomUUID?.() ?? `${Date.now()}-${Math.random()}`;

const entriesFromValue = (val?: Record<string, string>): SpecEntry[] => {
  if (!val) return [];
  return Object.entries(val).map(([k, v]) => ({
    id: generateId(),
    key: k,
    value: v,
  }));
};

const SpecificationsEditor: React.FC<SpecificationsEditorProps> = ({
  value,
  onChange,
}) => {
  // Internal state – initialised once from the value prop
  const [entries, setEntries] = useState<SpecEntry[]>(() =>
    entriesFromValue(value),
  );

  // Flag to avoid calling onChange while we're updating internally
  const internalUpdateRef = useRef(false);

  const callOnChange = useCallback(
    (newEntries: SpecEntry[]) => {
      const record: Record<string, string> = {};
      for (const { key, value } of newEntries) {
        if (key.trim()) {
          record[key] = value;
        }
      }
      internalUpdateRef.current = true;
      onChange(record);
    },
    [onChange],
  );

  const handleAddAttribute = useCallback(() => {
    setEntries((prev) => {
      const newEntry: SpecEntry = { id: generateId(), key: "", value: "" };
      const updated = [...prev, newEntry];
      callOnChange(updated);
      return updated;
    });
  }, [callOnChange]);

  const handleKeyChange = useCallback(
    (id: string, newKey: string) => {
      setEntries((prev) => {
        const updated = prev.map((e) =>
          e.id === id ? { ...e, key: newKey } : e,
        );
        callOnChange(updated);
        return updated;
      });
    },
    [callOnChange],
  );

  const handleValueChange = useCallback(
    (id: string, newValue: string) => {
      setEntries((prev) => {
        const updated = prev.map((e) =>
          e.id === id ? { ...e, value: newValue } : e,
        );
        callOnChange(updated);
        return updated;
      });
    },
    [callOnChange],
  );

  const handleDeleteAttribute = useCallback(
    (id: string) => {
      setEntries((prev) => {
        const updated = prev.filter((e) => e.id !== id);
        callOnChange(updated);
        return updated;
      });
    },
    [callOnChange],
  );

  return (
    <TableContainer component={Paper} variant="outlined">
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell>Key</TableCell>
            <TableCell>Value</TableCell>
            <TableCell align="right" width="50px">
              <IconButton size="small" onClick={handleAddAttribute}>
                <AddIcon fontSize="small" />
              </IconButton>
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {entries.map(({ id, key, value }) => (
            <TableRow key={id}>
              <TableCell>
                <TextField
                  size="small"
                  variant="standard"
                  fullWidth
                  value={key}
                  onChange={(e) => handleKeyChange(id, e.target.value)}
                />
              </TableCell>
              <TableCell>
                <TextField
                  size="small"
                  variant="standard"
                  fullWidth
                  value={value}
                  onChange={(e) => handleValueChange(id, e.target.value)}
                />
              </TableCell>
              <TableCell align="right">
                <IconButton
                  size="small"
                  onClick={() => handleDeleteAttribute(id)}
                >
                  <DeleteIcon fontSize="small" />
                </IconButton>
              </TableCell>
            </TableRow>
          ))}
          {entries.length === 0 && (
            <TableRow>
              <TableCell colSpan={3} align="center">
                No specifications. Click + to add.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default SpecificationsEditor;
