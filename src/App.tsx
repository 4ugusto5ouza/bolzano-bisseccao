import "./App.css";
import { Button, Card, Divider, Form, Input, Table } from "antd";
import Algebrite from "algebrite";
import { useState } from "react";

const layout = {
  labelCol: { span: 8 },
  wrapperCol: { span: 16 },
};
const tailLayout = {
  wrapperCol: { offset: 8, span: 16 },
};

type FormType = {
  funcpolinomial: string;
};

type AppState = {
  funcpolinomial: string;
};

function isSignal(term: string): boolean {
  debugger;
  return term === "+" || term === "-";
}

function App() {
  const [form] = Form.useForm<FormType>();
  const [state, setState] = useState<AppState>({
    funcpolinomial: "",
  });

  const handleCalcular = () => {
    debugger;
    let value = form.getFieldValue("funcpolinomial");

    value = value.replaceAll(" ", "");
    setState((prev) => ({ ...prev, funcpolinomial: value }));
    value = value.replaceAll("x", "3");
    const result = Algebrite.run(value);
    console.log(result);

    // while (value.includes("^")) {
    //   let posicaoPow = value.indexOf("^");
    //   let antPow = posicaoPow - 1;
    //   if (isSignal(value[posicaoPow + 1])) {
    //     posicaoPow = posicaoPow + 1;
    //   }
    //   let posPow = posicaoPow + 1;
    //   while (antPow > 0 && !isNaN(value[antPow - 1])) {
    //     antPow = antPow - 1;
    //   }
    //   while (!isNaN(value[posPow])) {
    //     posPow = posPow + 1;
    //   }
    //   const potencia = value.slice(antPow, posPow);
    //   const numbersPot = potencia.split("^");
    //   const resultadoPot = Math.pow(numbersPot[0], numbersPot[1]);
    //   value = value.replace(potencia, resultadoPot);

    //   console.log(value);
    // }
  };
  const handleLimpar = () => {
    form.resetFields();
  };
  const handleExemplo = () => {
    form.setFieldsValue({ funcpolinomial: "x^3 - 9*x + 3" });
  };

  return (
    <Card style={{ width: "800px" }}>
      <h1>{"Teorema de Bolzano"}</h1>
      <Form
        {...layout}
        form={form}
        labelCol={{ span: 8 }}
        style={{ maxWidth: 600 }}
      >
        <Form.Item
          label="f(x)"
          name="funcpolinomial"
          rules={[
            {
              required: true,
              message:
                "Para realização da operação é necessário informar uma função polinomial!",
            },
          ]}
        >
          <Input />
        </Form.Item>
        <Form.Item {...tailLayout}>
          <Button
            style={{ margin: "5px" }}
            type="primary"
            onClick={handleCalcular}
          >
            {"Calcular"}
          </Button>

          <Button
            style={{ margin: "5px" }}
            htmlType="button"
            onClick={handleLimpar}
          >
            {"Limpar"}
          </Button>

          <Button
            style={{ margin: "5px" }}
            type="link"
            htmlType="button"
            onClick={handleExemplo}
          >
            {"Exemplo"}
          </Button>
        </Form.Item>
      </Form>
      <Card>
        {state.funcpolinomial.length > 0 && (
          <h3>{`f(x) = ${state.funcpolinomial}`}</h3>
        )}
        <Divider />
        <Table
          columns={[
            {
              title: "Função",
              dataIndex: "func",
              key: "func",
            },
            {
              title: "x",
              dataIndex: "x",
              key: "x",
            },
            {
              title: "f(x)",
              dataIndex: "f(x)",
              key: "f(x)",
            },
            {
              title: "Sinal",
              dataIndex: "sinal",
              key: "sinal",
            },
          ]}
        />
      </Card>
    </Card>
  );
}

export default App;
