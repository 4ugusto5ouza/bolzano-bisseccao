import "./App.css";
import { Button, Card, Divider, Form, Input, Table, message } from "antd";
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

type DataSourceType = {
  func: string;
  xValue: number;
  fxValue: number;
  sinal: "+" | "-";
};

type AppState = {
  funcpolinomial: string;
  xValueInitial: number;
  dataSource: DataSourceType[];
  loading: boolean;
};

function App() {
  const [form] = Form.useForm<FormType>();
  const [messageApi, contextHolder] = message.useMessage();
  const [state, setState] = useState<AppState>({
    funcpolinomial: "",
    xValueInitial: 50,
    dataSource: [],
    loading: false,
  });

  const dataSourceAux: DataSourceType[] = [];
  const handleCalcular = () => {
    let value = form.getFieldValue("funcpolinomial");
    value = value.replaceAll(" ", "");
    setState((prev) => ({ ...prev, funcpolinomial: value, loading: true }));
    value = value.replaceAll("x", "(x)");

    for (
      let index = state.xValueInitial * -1;
      index <= state.xValueInitial;
      index++
    ) {
      const func = value.replaceAll("x", `${index}`);
      const fx = Algebrite.run(func);

      if (isNaN(fx)) {
        messageApi.open({
          type: "error",
          content: "Há um erro de sintaxe na função informada!",
          duration: 3,
          style: {
            marginTop: "5vh",
          },
        });
        break;
      }

      const data: DataSourceType = {
        func,
        xValue: index,
        fxValue: fx,
        sinal: fx >= 0 ? "+" : "-",
      };
      dataSourceAux.push(data);
    }

    setTimeout(() => {
      setState((prev) => ({
        ...prev,
        dataSource: dataSourceAux,
        loading: false,
      }));
    }, 3000);
  };
  const handleLimpar = () => {
    form.resetFields();
    setState((prev) => ({ ...prev, funcpolinomial: "", dataSource: [] }));
  };
  const handleExemplo = () => {
    form.setFieldsValue({ funcpolinomial: "x^3 - 9*x + 3" });
  };

  return (
    <Card style={{ width: "800px", height: "100%" }}>
      <h1>{"Teorema de Bolzano"}</h1>
      {contextHolder}
      <Form
        {...layout}
        form={form}
        labelCol={{ span: 8 }}
        style={{ maxWidth: 600 }}
        onFinish={handleCalcular}
      >
        <Form.Item
          label="f(x)"
          name="funcpolinomial"
          rules={[
            {
              required: true,
              message: "Necessário informar uma função polinomial!",
            },
          ]}
        >
          <Input placeholder="x^3 - 9*x + 3" />
        </Form.Item>
        <Form.Item {...tailLayout}>
          <Button
            style={{ margin: "5px" }}
            type="primary"
            htmlType="submit"
            loading={state.loading}
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
          size="small"
          loading={state.loading}
          columns={[
            {
              title: "x",
              dataIndex: "xValue",
              key: "xValue",
            },
            {
              title: "Função",
              dataIndex: "func",
              key: "func",
            },
            {
              title: "f(x)",
              dataIndex: "fxValue",
              key: "fxValue",
            },
            {
              title: "Sinal",
              dataIndex: "sinal",
              key: "sinal",
            },
          ]}
          dataSource={state.dataSource}
          rowKey={(record) => record.xValue}
          pagination={{
            size: "small",
            position: ["bottomCenter"],
          }}
          style={{
            height: "450px",
          }}
        />
      </Card>
    </Card>
  );
}

export default App;
