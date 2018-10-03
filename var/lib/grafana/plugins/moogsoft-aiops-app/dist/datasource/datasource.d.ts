/// <reference path="../../node_modules/grafana-sdk-mocks/app/headers/common.d.ts" />
export declare class MoogsoftDatasource {
    private backendSrv;
    private templateSrv;
    private $q;
    id: number;
    name: string;
    url: string;
    cache: any;
    statsPromise: any;
    /** @ngInject */
    constructor(instanceSettings: any, backendSrv: any, templateSrv: any, $q: any);
    query(options: any): any;
    testDatasource(): any;
    private fetch(url, params?);
    metricFindQuery(endpoint: string): any;
    getStats(): any;
}
