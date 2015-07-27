function AppViewModel() {
    var self = this;
    
    // List of folders (modules)
    self.folders = ko.observableArray();
    // Complete JSON of the current module
    self.json = {};
    // Languages in the current module
    self.languages = ko.observableArray();
    // Key - Value - Reference (in english)
    self.lines = ko.observableArray();
    // Name of the page the user viewing
    self.currentPage = ko.observable();
    // Page header with breadcrumbs
    self.currentPageHeader = ko.observable();
    self.currentModule = ko.observable();
    self.currentLang = ko.observable();

    self.goToLang = function (folder) {location.hash = folder;};
    self.goToEdit = function (lang) {location.hash = self.currentModule() + '/' + lang;};
    self.saveData = function () {
        var postObj = {};
        postObj.module = self.currentModule();
        postObj.lang = self.currentLang();
        postObj.content = {};
        
        self.lines().forEach(function (obj) {
            postObj.content[obj['key']] = obj['value'];
        });

        $.post('/data/post/save', postObj, function (res) {
            console.log(res);
        });
    };

    // Sammy.js config - URL hash
    Sammy(function () {
        this.get('/', function () {
            self.currentPage('folders');
            self.currentPageHeader('Choose a module...');
            $.getJSON('/data/get/folders', function (data) {
                self.folders(data);
            });
        });

        this.get('#:folder', function () {
            self.currentPage('lang');
            self.currentModule(this.params.folder);
            self.currentPageHeader(this.params.folder + ' | Choose a language...');
            $.post('/data/post/folder', {folder: this.params.folder}, function (returnedData) {
                self.json = JSON.parse(returnedData);
                self.languages(Object.keys(self.json));
            });
        });

        this.get('#:folder/:lang', function () {
            self.lines([]);
            self.currentPage('edit');
            self.currentLang(this.params.lang);
            self.currentPageHeader(self.currentModule() + ' | ' + this.params.lang);
            var ref = self.json['en'];
            var lang = self.json[this.params.lang];
            for (var key in ref) {
                self.lines.push({key: key, value: lang[key], ref: ref[key]});
            }
        });  
    }).run();
};

ko.applyBindings(new AppViewModel());
