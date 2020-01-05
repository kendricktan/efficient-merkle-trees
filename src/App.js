import React, { useState } from 'react';

import { 
  Container,
  Row,
  Col,
  Label,
  Button,
  Input,
  Form,
  FormGroup,
  Dropdown,
  DropdownToggle,
  DropdownMenu,
  DropdownItem
} from 'reactstrap';

import { Stage, Layer, Text, Rect } from 'react-konva';
import Konva from 'konva';

import { bigInt } from 'snarkjs'
import { createMerkleTree } from './utils/merkletree.js'

import 'bootstrap/dist/css/bootstrap.min.css';

const ActionTypes = {
  Insert: "Insert",
  Update: "Update",
  Verify: "Verify"
}

const AppSettings = () => {
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [action, setAction] = useState(ActionTypes.Insert)

  return (
    <div style={{ paddingTop: '30px' }}>
      <hr />
      <Form>
        <FormGroup>
          <Label>Action</Label>
          <Dropdown isOpen={dropdownOpen} toggle={() => setDropdownOpen(!dropdownOpen)}>
            <DropdownToggle caret>
              {action}
            </DropdownToggle>
            <DropdownMenu>
              {
                Object
                  .keys(ActionTypes)
                  .map(x => {
                    return (
                      <DropdownItem 
                        key={x}
                        onClick={() => setAction(ActionTypes[x])}
                      >
                        {ActionTypes[x]}
                      </DropdownItem>
                    )
                  })
              }
            </DropdownMenu>
          </Dropdown>
        </FormGroup>
        <FormGroup>
          <Label>Leaf Index</Label>
          <Input disabled={action === ActionTypes.Insert} placeholder="0" />
        </FormGroup>
        <FormGroup>
          <Label>Leaf Value</Label>
          <Input placeholder="0" />
        </FormGroup>
        <FormGroup>
          <Button block>
            Go
          </Button>
        </FormGroup>
      </Form>
      <hr />
    </div>
  )
}

const ColoredRect = () => {
  const [color, setColor] = useState('green')

  return (
    <Rect
      x={20}
      y={20}
      width={50}
      height={50}
      fill={color}
      shadowBlur={5}
      onClick={() => setColor(Konva.Util.getRandomColor())}
    />
  );
}


const App = () => {
  return (
    <Container>
      <Row>
        <Col sm="12" md={{ size: 8, offset: 2 }}>
          <AppSettings />
        </Col>
        <Col sm="12" md="12">
          <Stage width={window.innerWidth} height={window.innerHeight}>
            <Layer>
              <Text text="Try click on rect" />
              <ColoredRect />
            </Layer>
          </Stage>
        </Col>
      </Row>
    </Container>
  );
}

export default App;
