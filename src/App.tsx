import "./App.css";
import {
  Button,
  Card,
  Divider,
  Form,
  Input,
  Table,
  message,
  Tabs,
  Select,
  Space,
} from "antd";
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

type Interval = {
  a: DataSourceType;
  b: DataSourceType;
  label: string;
};

type IteracaoK = {
  label: string;
  k: Interval;
};

type AppState = {
  funcpolinomial: string;
  xValueInitial: number;
  dataSource: DataSourceType[];
  intervals: Interval[];
  selectedInterval: Interval | undefined;
  iteracaoK: IteracaoK | undefined;
  epsilon: number | undefined;
  loadingGeneretInterval: boolean;
  loadingEpsilon: boolean;
};

function App() {
  const [form] = Form.useForm<FormType>();
  const [formInterval] = Form.useForm<FormType>();
  const [messageApi, contextHolder] = message.useMessage();
  const [state, setState] = useState<AppState>({
    funcpolinomial: "",
    xValueInitial: 1000,
    dataSource: [],
    intervals: [],
    iteracaoK: undefined,
    selectedInterval: undefined,
    epsilon: undefined,
    loadingGeneretInterval: false,
    loadingEpsilon: false,
  });

  const dataSourceAux: DataSourceType[] = [];
  const intervalsAux: Interval[] = [];
  const kAux: IteracaoK[] = [];

  const handleClickGerarIntervalos = () => {
    let value = form.getFieldValue("funcpolinomial");
    value = value.replaceAll(" ", "");
    setState((prev) => ({
      ...prev,
      funcpolinomial: value,
      loadingGeneretInterval: true,
    }));
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

      if (dataSourceAux.length > 1) {
        const sinal01 = dataSourceAux[dataSourceAux.length - 1].sinal;
        const sinal02 = dataSourceAux[dataSourceAux.length - 2].sinal;

        if (sinal01 !== sinal02) {
          const a = dataSourceAux[dataSourceAux.length - 2];
          const b = dataSourceAux[dataSourceAux.length - 1];
          intervalsAux.push({
            a,
            b,
            label: `[${a.xValue}, ${b.xValue}]`,
          });
        }
      }
    }

    setTimeout(() => {
      setState((prev) => ({
        ...prev,
        dataSource: dataSourceAux,
        intervals: intervalsAux,
        loadingGeneretInterval: false,
      }));
    }, 3000);
  };

  const handleClickLimpar = () => {
    form.resetFields();
    formInterval.resetFields();
    setState({
      funcpolinomial: "",
      xValueInitial: 1000,
      dataSource: [],
      intervals: [],
      iteracaoK: undefined,
      selectedInterval: undefined,
      epsilon: undefined,
      loadingGeneretInterval: false,
      loadingEpsilon: false,
    });
  };

  const handleClickExemplo = () => {
    form.setFieldsValue({ funcpolinomial: "x^3 - 9*x + 3" });
  };

  const handleClickCalcularEpsilon = () => {
    let value = formInterval.getFieldValue("epsilon");

    if (isNaN(value)) {
      messageApi.open({
        type: "error",
        content: "Insira um valor válido para critério de parada!",
        duration: 3,
        style: {
          marginTop: "5vh",
        },
      });
    }
    if (value == 0) {
      messageApi.open({
        type: "error",
        content:
          "O valor para o critério de parada deve ser diferente de zero!",
        duration: 3,
        style: {
          marginTop: "5vh",
        },
      });
    }
    setState((prev) => ({
      ...prev,
      epsilon: value,
      loadingEpsilon: true,
    }));

    const { selectedInterval, funcpolinomial } = state;
    let fxAux = 1000;
    let count = 1;
    const a = selectedInterval?.a as DataSourceType;
    const b = selectedInterval?.b as DataSourceType;
    let aValue = a.xValue;
    let bValue = b.xValue;
    let aFxValue = a.fxValue;
    let bFxValue = b.fxValue;
    let aFunc = a.func;
    let bFunc = b.func;

    while (Math.abs(fxAux) >= value) {
      const kValue = Number(((aValue + bValue) / 2).toFixed(value.length));

      let func = funcpolinomial.replaceAll("x", "(x)");
      func = func.replaceAll("x", `${kValue}`);
      fxAux = Number(
        Number(Algebrite.run(func).replace("...", "")).toFixed(value.length)
      );
      console.log(fxAux);

      const replaceA = fxAux > 0 === aFxValue > 0;
      if (replaceA) {
        aValue = kValue;
        aFxValue = fxAux;
        aFunc = func;
      } else {
        bValue = kValue;
        bFxValue = fxAux;
        bFunc = func;
      }

      kAux.push({
        label: `k${count}`,
        k: replaceA
          ? {
              a: {
                func,
                fxValue: fxAux,
                xValue: kValue,
                sinal: fxAux >= 0 ? "+" : "-",
              },
              b: {
                func: bFunc,
                fxValue: bFxValue,
                xValue: bValue,
                sinal: bFxValue >= 0 ? "+" : "-",
              },
              label: "",
            }
          : {
              a: {
                func: aFunc,
                fxValue: aFxValue,
                xValue: aValue,
                sinal: aFxValue >= 0 ? "+" : "-",
              },
              b: {
                func,
                fxValue: fxAux,
                xValue: kValue,
                sinal: fxAux >= 0 ? "+" : "-",
              },
              label: "",
            },
      });
      count++;
    }
    console.log(kAux);
  };

  return (
    <Card style={{ width: "800px", height: "100%" }}>
      <h2>{"Teorema de Bolzano"}</h2>
      {contextHolder}
      <Form
        {...layout}
        form={form}
        style={{ maxWidth: 600 }}
        onFinish={handleClickGerarIntervalos}
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
          <Space wrap>
            <Button
              type="primary"
              htmlType="submit"
              loading={state.loadingGeneretInterval}
            >
              {"Gerar intervalos"}
            </Button>
            <Button htmlType="button" onClick={handleClickLimpar}>
              {"Limpar"}
            </Button>
            <Button type="link" htmlType="button" onClick={handleClickExemplo}>
              {"Exemplo"}
            </Button>{" "}
          </Space>
        </Form.Item>
      </Form>
      <Form
        {...layout}
        form={formInterval}
        style={{ maxWidth: 600 }}
        onFinish={handleClickCalcularEpsilon}
      >
        <Form.Item
          labelCol={{ span: 15 }}
          wrapperCol={{ span: 4 }}
          label="Selecione o intervalo:"
          name="intervalselected"
          style={{ display: "inline-block", width: "calc(65% - 8px)" }}
          rules={[
            {
              required: true,
              message: "Informe um intervalo!",
            },
          ]}
        >
          <Select
            style={{ width: 85 }}
            value={state.selectedInterval ? state.selectedInterval.label : null}
            disabled={!(state.intervals.length > 0)}
            options={state.intervals.map((x) => {
              return {
                value: x.label,
                label: x.label,
              };
            })}
            onChange={(value) => {
              const optionSelected = state.intervals.find(
                (x) => x.label === value
              );
              setState((prev) => ({
                ...prev,
                selectedInterval: optionSelected,
              }));
            }}
          />
        </Form.Item>
        <Form.Item
          label="Epsilon"
          name="epsilon"
          style={{ display: "inline-block", width: "calc(35% - 8px)" }}
          rules={[
            {
              required: true,
              message: "Informe um critério de parada!",
            },
          ]}
        >
          <Input disabled={!(state.intervals.length > 0)} />
        </Form.Item>
        <Form.Item wrapperCol={{ offset: 8, span: 7 }}>
          <Button
            type="primary"
            htmlType="submit"
            loading={state.loadingEpsilon}
          >
            {"Calcular"}
          </Button>
        </Form.Item>
      </Form>
      <Card>
        {state.funcpolinomial.length > 0 && (
          <h3>{`f(x) = ${state.funcpolinomial}`}</h3>
        )}
        <Tabs
          items={[
            {
              key: "fase0",
              label: "Fase 0",
              children: (
                <Table
                  size="small"
                  loading={state.loadingGeneretInterval}
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
              ),
            },
            {
              key: "fase1",
              label: "Fase 1",
              children: (
                <>
                  {state.intervals && (
                    <>
                      {state.intervals.map((x) => {
                        return (
                          <>
                            {`Intervalo [${x.a.xValue}, ${x.b.xValue}] `}{" "}
                            <br></br>
                          </>
                        );
                      })}
                    </>
                  )}
                </>
              ),
            },
          ]}
        />
      </Card>
    </Card>
  );
}

export default App;
