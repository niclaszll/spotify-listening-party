import React, { useState } from 'react'
import Button from '@material-ui/core/Button'
import TextField from '@material-ui/core/TextField'
import Dialog from '@material-ui/core/Dialog'
import DialogActions from '@material-ui/core/DialogActions'
import DialogContent from '@material-ui/core/DialogContent'
import DialogTitle from '@material-ui/core/DialogTitle'
import { useHistory } from 'react-router-dom'

type PasswordDialogProps = {
  open: boolean
  togglePasswordDialog: (open: boolean) => void
  checkPassword: (password: string) => void
}

export default function PasswordDialog({
  open,
  togglePasswordDialog,
  checkPassword,
}: PasswordDialogProps) {
  const [password, setPassword] = useState<string>('')
  const history = useHistory<any>()

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { target } = e
    setPassword(target.value)
  }

  return (
    <div>
      <Dialog
        open={open}
        onClose={() => togglePasswordDialog(false)}
        aria-labelledby="form-dialog-title"
      >
        <DialogTitle id="form-dialog-title">Enter Password for private room</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            id="password"
            label="Password"
            type="password"
            value={password}
            onChange={handleChange}
            fullWidth
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => history.push('/lobby')} color="primary">
            Go Back
          </Button>
          <Button onClick={() => checkPassword(password)} color="primary">
            Enter
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  )
}
