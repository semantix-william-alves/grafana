/// <reference path="../node_modules/grafana-sdk-mocks/app/headers/common.d.ts" />
export declare class AppConfigCtrl {
    private datasourceSrv;
    private backendSrv;
    private $q;
    static templateUrl: string;
    appEditCtrl: any;
    dsConfig: any;
    appModel: any;
    testRes: any;
    constructor(datasourceSrv: any, backendSrv: any, $q: any);
    getDsConfig(): any;
    testDatasource(): void;
    removeDatasource(): any;
    postUpdate(): any;
}
