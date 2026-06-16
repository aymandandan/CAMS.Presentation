import React from "react";
import {
  Box,
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
import type { EquipmentSpecificationsDto } from "@/domain/equipment/EquipmentTypes";

interface EquipmentSpecificationsEditorProps {
  value: EquipmentSpecificationsDto | undefined;
  onChange: (specs: EquipmentSpecificationsDto) => void;
}

const EquipmentSpecificationsEditor: React.FC<
  EquipmentSpecificationsEditorProps
> = ({ value, onChange }) => {
  // Ensure we always have a valid object
  const specifications = value ?? {
    installationDate: "",
    weight: undefined,
    weightUnit: "",
    customAttributes: {},
  };

  const handleBasicChange = (
    field: keyof EquipmentSpecificationsDto,
    val: any,
  ) => {
    onChange({ ...specifications, [field]: val });
  };

  const handleCustomAttributeChange = (
    oldKey: string,
    newKey: string,
    newValue: string,
  ) => {
    const newAttributes = { ...specifications.customAttributes };
    if (oldKey !== newKey) {
      delete newAttributes[oldKey];
    }
    if (newKey.trim()) {
      newAttributes[newKey] = newValue;
    }
    onChange({ ...specifications, customAttributes: newAttributes });
  };

  const handleAddAttribute = () => {
    // Use a timestamp to generate a temporary unique key (avoids duplicate "")
    const newKey = `new_attr_${Date.now()}`;
    const newAttributes = { ...specifications.customAttributes, [newKey]: "" };
    onChange({ ...specifications, customAttributes: newAttributes });
  };

  const handleDeleteAttribute = (key: string) => {
    const newAttributes = { ...specifications.customAttributes };
    delete newAttributes[key];
    onChange({ ...specifications, customAttributes: newAttributes });
  };

  const attributeEntries = Object.entries(specifications.customAttributes);

  return (
    <Box>
      {/* Basic specification fields */}
      <Box sx={{ display: "flex", gap: 2, mb: 2 }}>
        <TextField
          label="Installation Date"
          type="date"
          slotProps={{ inputLabel: { shrink: true } }}
          value={specifications.installationDate?.substring(0, 10) ?? ""}
          onChange={(e) =>
            handleBasicChange(
              "installationDate",
              e.target.value
                ? new Date(e.target.value).toISOString()
                : undefined,
            )
          }
          fullWidth
        />
        <TextField
          label="Weight"
          type="number"
          value={specifications.weight ?? ""}
          onChange={(e) =>
            handleBasicChange(
              "weight",
              e.target.value ? Number(e.target.value) : undefined,
            )
          }
          fullWidth
        />
        <TextField
          label="Weight Unit"
          value={specifications.weightUnit ?? ""}
          onChange={(e) => handleBasicChange("weightUnit", e.target.value)}
          fullWidth
        />
      </Box>

      {/* Custom attributes table */}
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
            {attributeEntries.map(([key, val]) => (
              <TableRow key={key}>
                <TableCell>
                  <TextField
                    size="small"
                    variant="standard"
                    fullWidth
                    value={key.startsWith("new_attr_") ? "" : key} // display empty for temp key
                    onChange={(e) =>
                      handleCustomAttributeChange(key, e.target.value, val)
                    }
                  />
                </TableCell>
                <TableCell>
                  <TextField
                    size="small"
                    variant="standard"
                    fullWidth
                    value={val}
                    onChange={(e) =>
                      handleCustomAttributeChange(key, key, e.target.value)
                    }
                  />
                </TableCell>
                <TableCell align="right">
                  <IconButton
                    size="small"
                    onClick={() => handleDeleteAttribute(key)}
                  >
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
            {attributeEntries.length === 0 && (
              <TableRow>
                <TableCell colSpan={3} align="center">
                  No custom attributes. Click + to add.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default EquipmentSpecificationsEditor;
